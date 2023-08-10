import * as babel from '@babel/core';
import { createMitosisContext } from '../helpers/create-mitosis-context';
import { MitosisContext } from '../types/mitosis-context';
import { parseStateObjectToMitosisState } from './jsx/state';

const { types } = babel;

const tsPreset = require('@babel/preset-typescript');

type ParseContextOptions = {
  name: string;
};

export function parseContext(code: string, options: ParseContextOptions): MitosisContext | null {
  let found = false;
  const context = createMitosisContext({ name: options.name });

  babel.transform(code, {
    configFile: false,
    babelrc: false,
    presets: [[tsPreset, { isTSX: true, allExtensions: true }]],
    plugins: [
      () => ({
        visitor: {
          Program(path: babel.NodePath<babel.types.Program>) {
            for (const item of path.node.body) {
              if (types.isExportDefaultDeclaration(item)) {
                const expression = item.declaration;
                if (types.isCallExpression(expression)) {
                  if (
                    types.isIdentifier(expression.callee) &&
                    expression.callee.name === 'createContext'
                  ) {
                    const [firstArg, secondArg] = expression.arguments;
                    if (types.isObjectExpression(firstArg)) {
                      // TODO: support non object values by parsing any node type
                      // like the logic within each property value of parseStateObject
                      context.value = parseStateObjectToMitosisState(firstArg);

                      if (types.isObjectExpression(secondArg)) {
                        for (const prop of secondArg.properties) {
                          if (!types.isProperty(prop) || !types.isIdentifier(prop.key)) continue;
                          const isReactive = prop.key.name === 'reactive';

                          if (
                            isReactive &&
                            types.isBooleanLiteral(prop.value) &&
                            prop.value.value
                          ) {
                            context.type = 'reactive';
                          }
                        }
                      }
                      found = true;
                    }
                  }
                }
              }
            }
          },
        },
      }),
    ],
  });

  if (!found) {
    return null;
  }
  return context;
}
