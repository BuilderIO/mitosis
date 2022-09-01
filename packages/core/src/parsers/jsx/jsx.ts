import * as babel from '@babel/core';
import generate from '@babel/generator';
import { createMitosisComponent } from '../../helpers/create-mitosis-component';
import { stripNewlinesInStrings } from '../../helpers/replace-new-lines-in-strings';
import { MitosisComponent } from '../../types/mitosis-component';
import { tryParseJson } from '../../helpers/json';
import { jsonToAst } from './ast';
import { mapStateIdentifiers } from './state';
import { Context, ParseMitosisOptions } from './types';
import { collectMetadata } from './metadata';
import { extractContextComponents } from './context';
import { isImportOrDefaultExport } from './helpers';
import { collectTypes, handleTypeImports, isTypeOrInterface } from './component-types';
import { undoPropsDestructure } from './props';
import { generateExports } from './exports';
import { pipe } from 'fp-ts/lib/function';
import { handleImportDeclaration } from './imports';
import { jsxElementToJson } from './element-parser';
import { componentFunctionToJson } from './function-parser';

const jsxPlugin = require('@babel/plugin-syntax-jsx');
const tsPreset = require('@babel/preset-typescript');

const { types } = babel;

const beforeParse = (path: babel.NodePath<babel.types.Program>) => {
  path.traverse({
    FunctionDeclaration(path) {
      undoPropsDestructure(path);
    },
  });
};

/**
 * This function takes the raw string from a Mitosis component, and converts it into a JSON that can be processed by
 * each generator function.
 *
 * @param jsx string representation of the Mitosis component
 * @returns A JSON representation of the Mitosis component
 */
export function parseJsx(
  jsx: string,
  options: Partial<ParseMitosisOptions> = {},
): MitosisComponent {
  const useOptions: ParseMitosisOptions = {
    format: 'react',
    ...options,
  };

  let subComponentFunctions: string[] = [];

  const output = babel.transform(jsx, {
    configFile: false,
    babelrc: false,
    comments: false,
    presets: [
      [
        tsPreset,
        {
          isTSX: true,
          allExtensions: true,
          // If left to its default `false`, then this will strip away:
          // - unused JS imports
          // - types imports within regular JS import syntax
          onlyRemoveTypeImports: true,
        },
      ],
    ],
    plugins: [
      jsxPlugin,
      (): babel.PluginObj<Context> => ({
        visitor: {
          JSXExpressionContainer(path, context) {
            if (types.isJSXEmptyExpression(path.node.expression)) {
              path.remove();
            }
          },
          Program(path, context) {
            if (context.builder) {
              return;
            }

            beforeParse(path);

            context.builder = {
              component: createMitosisComponent(),
            };

            const keepStatements = path.node.body.filter(
              (statement) => isImportOrDefaultExport(statement) || isTypeOrInterface(statement),
            );

            handleTypeImports(path, context);

            context.builder.component.exports = generateExports(path);

            subComponentFunctions = path.node.body
              .filter(
                (node) =>
                  !types.isExportDefaultDeclaration(node) && types.isFunctionDeclaration(node),
              )
              .map((node) => `export default ${generate(node).code!}`);

            const preComponentCode = pipe(
              path.node.body.filter((statement) => !isImportOrDefaultExport(statement)),
              (statements) => collectMetadata(statements, context.builder.component, useOptions),
              types.program,
              generate,
              (generatorResult) => generatorResult.code,
            );

            // TODO: support multiple? e.g. for others to add imports?
            context.builder.component.hooks.preComponent = { code: preComponentCode };

            path.replaceWith(types.program(keepStatements));
          },
          FunctionDeclaration(path, context) {
            const { node } = path;
            if (types.isIdentifier(node.id)) {
              const name = node.id.name;
              if (name[0].toUpperCase() === name[0]) {
                path.replaceWith(jsonToAst(componentFunctionToJson(node, context)));
              }
            }
          },
          ImportDeclaration(path, context) {
            handleImportDeclaration({ options, path, context });
          },
          ExportDefaultDeclaration(path) {
            path.replaceWith(path.node.declaration);
          },
          JSXElement(path) {
            const { node } = path;
            path.replaceWith(jsonToAst(jsxElementToJson(node)));
          },
          ExportNamedDeclaration(path, context) {
            const { node } = path;
            if (
              babel.types.isTSInterfaceDeclaration(node.declaration) ||
              babel.types.isTSTypeAliasDeclaration(node.declaration)
            ) {
              collectTypes(path.node, context);
            }
          },
          TSTypeAliasDeclaration(path, context) {
            collectTypes(path.node, context);
          },
          TSInterfaceDeclaration(path, context) {
            collectTypes(path.node, context);
          },
        },
      }),
    ],
  });

  const toParse = stripNewlinesInStrings(
    output!
      .code!.trim()
      // Occasional issues where comments get kicked to the top. Full fix should strip these sooner
      .replace(/^\/\*[\s\S]*?\*\/\s*/, '')
      // Weird bug with adding a newline in a normal at end of a normal string that can't have one
      // If not one-off find full solve and cause
      .replace(/\n"/g, '"')
      .replace(/^\({/, '{')
      .replace(/}\);$/, '}'),
  );
  const parsed = tryParseJson(toParse);

  mapStateIdentifiers(parsed);
  extractContextComponents(parsed);

  parsed.subComponents = subComponentFunctions.map((item) => parseJsx(item, useOptions));

  return parsed;
}
