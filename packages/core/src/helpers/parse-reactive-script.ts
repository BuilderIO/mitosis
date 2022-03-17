import { types, transform } from '@babel/core';
import generate from '@babel/generator';
import json5 from 'json5';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { createFunctionStringLiteralObjectProperty } from '../parsers/jsx';

export type ParseReactiveScriptOptions = {
  format: 'html' | 'js';
};

export const reactiveScriptRe = /<script\s[^>]*reactive[^>]*>([\s\S]*)<\/\s*script>/i;

export function parseReactiveScript(
  code: string,
  options: ParseReactiveScriptOptions,
): { state: any } {
  let state = {};
  const format = options.format || 'html';
  const useCode =
    format === 'html' ? code.match(reactiveScriptRe)?.[1] || '' : code;

  const output = transform(useCode, {
    plugins: [
      () => ({
        visitor: {
          ExportDefaultDeclaration(
            path: babel.NodePath<babel.types.ExportDefaultDeclaration>,
          ) {
            if (types.isObjectExpression(path.node.declaration)) {
              const stateProperty = path.node.declaration.properties.find(
                (item) =>
                  types.isObjectProperty(item) &&
                  types.isIdentifier(item.key) &&
                  item.key.name === 'state',
              ) as types.ObjectProperty | null;

              if (stateProperty) {
                const value = stateProperty.value;
                if (types.isObjectExpression(value)) {
                  const properties = value.properties;
                  const useProperties = properties.map((item) => {
                    if (types.isObjectProperty(item)) {
                      if (
                        types.isFunctionExpression(item.value) ||
                        types.isArrowFunctionExpression(item.value)
                      ) {
                        return createFunctionStringLiteralObjectProperty(
                          item.key,
                          item.value,
                        );
                      }
                    }
                    if (types.isObjectMethod(item)) {
                      return types.objectProperty(
                        item.key,
                        types.stringLiteral(
                          `${methodLiteralPrefix}${
                            generate({ ...item, returnType: null }).code
                          }`,
                        ),
                      );
                    }
                    // Remove typescript types, e.g. from
                    // { foo: ('string' as SomeType) }
                    if (types.isObjectProperty(item)) {
                      let value = item.value;
                      if (types.isTSAsExpression(value)) {
                        value = value.expression;
                      }
                      return types.objectProperty(item.key, value);
                    }
                    return item;
                  });

                  const newObject = types.objectExpression(useProperties);
                  let code;
                  let obj;
                  try {
                    code = generate(newObject).code!;
                    obj = json5.parse(code);
                  } catch (err) {
                    console.error('Could not JSON5 parse object:\n', code);
                    throw err;
                  }
                  state = obj;
                }
              }
            }
          },
        },
      }),
    ],
  });

  return { state };
}
