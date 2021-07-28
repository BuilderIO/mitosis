import * as babel from '@babel/core';
import { JSXLiteContext } from '../types/mitosis-context';
import { createJsxLiteContext } from '../helpers/create-mitosis-context';
import { parseStateObject } from './jsx';

const { types } = babel;

const tsPreset = require('@babel/preset-typescript');

type ParseContextOptions = {
  name: string;
};

export function parseContext(
  code: string,
  options: ParseContextOptions,
): JSXLiteContext | null {
  let found = false;
  const context = createJsxLiteContext({ name: options.name });

  babel.transform(code, {
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
                    const firstArg = expression.arguments[0];
                    if (types.isObjectExpression(firstArg)) {
                      // TODO: support non object values by parsing any node type
                      // like the logic within each property value of parseStateObject
                      context.value = parseStateObject(firstArg);
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
