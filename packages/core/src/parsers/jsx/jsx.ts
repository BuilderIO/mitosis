import * as babel from '@babel/core';
import generate from '@babel/generator';
import { pipe } from 'fp-ts/lib/function';
import { createMitosisComponent } from '../../helpers/create-mitosis-component';
import { tryParseJson } from '../../helpers/json';
import { stripNewlinesInStrings } from '../../helpers/replace-new-lines-in-strings';
import { MitosisComponent } from '../../types/mitosis-component';
import { jsonToAst } from './ast';
import { collectTypes, isTypeOrInterface } from './component-types';
import { extractContextComponents } from './context';
import { jsxElementToJson } from './element-parser';
import { generateExports } from './exports';
import { componentFunctionToJson } from './function-parser';
import { isImportOrDefaultExport } from './helpers';
import { collectModuleScopeHooks } from './hooks';
import { handleImportDeclaration } from './imports';
import { undoPropsDestructure } from './props';
import { mapStateIdentifiers } from './state';
import { Context, ParseMitosisOptions } from './types';

import tsPlugin from '@babel/plugin-syntax-typescript';
import tsPreset from '@babel/preset-typescript';

const { types } = babel;

const typescriptBabelPreset = [tsPreset, { isTSX: true, allExtensions: true }];

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
  _options: Partial<ParseMitosisOptions> = {},
): MitosisComponent {
  let subComponentFunctions: string[] = [];

  const options: ParseMitosisOptions = {
    typescript: false,
    ..._options,
  };

  const jsxToUse = options.typescript
    ? jsx
    : // strip typescript types by running through babel's TS preset.
      (babel.transform(jsx, {
        configFile: false,
        babelrc: false,
        presets: [typescriptBabelPreset],
      })?.code as string);

  const output = babel.transform(jsxToUse, {
    configFile: false,
    babelrc: false,
    comments: false,
    plugins: [
      [tsPlugin, { isTSX: true }],
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

            context.builder.component.exports = generateExports(path);

            subComponentFunctions = path.node.body
              .filter(
                (node) =>
                  !types.isExportDefaultDeclaration(node) && types.isFunctionDeclaration(node),
              )
              .map((node) => `export default ${generate(node).code!}`);

            const preComponentCode = pipe(
              path.node.body.filter((statement) => !isImportOrDefaultExport(statement)),
              (statements) =>
                collectModuleScopeHooks(statements, context.builder.component, options),
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
              collectTypes(path, context);
            }
          },
          TSTypeAliasDeclaration(path, context) {
            collectTypes(path, context);
          },
          TSInterfaceDeclaration(path, context) {
            collectTypes(path, context);
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

  parsed.subComponents = subComponentFunctions.map((item) => parseJsx(item, options));

  return parsed;
}
