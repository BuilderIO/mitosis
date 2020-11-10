import * as babel from '@babel/core';
import generate from '@babel/generator';
import JSON5 from 'json5';
import { JSXLiteNode } from './types/jsx-lite-node';
import { JSONObject, JSONOrNode, JSONOrNodeObject } from './types/json';
import { createJSXLiteNode } from './helpers/create-jsx-lite-node';
import { JSXLiteComponent, JSXLiteImport } from './types/jsx-lite-component';
import { createJSXLiteComponent } from './helpers/create-jsx-lite-component';
import { functionLiteralPrefix } from './constants/function-literal-prefix';
import { methodLiteralPrefix } from './constants/method-literal-prefix';

const jsxPlugin = require('@babel/plugin-syntax-jsx');
const tsPreset = require('@babel/preset-typescript');

export const selfClosingTags = new Set(['input', 'meta', 'bar']);

const { types } = babel;

type Context = {
  // Babel has other context
  builder: {
    component: JSXLiteComponent;
  };
};

const arrayToAst = (array: JSONOrNode[]) => {
  return types.arrayExpression(array.map((item) => jsonToAst(item)) as any);
};

const jsonToAst = (json: JSONOrNode): babel.Node => {
  if (types.isNode(json as any)) {
    if (types.isJSXText(json as any)) {
      return types.stringLiteral((json as any).value);
    }
    return json as babel.Node;
  }
  switch (typeof json) {
    case 'undefined':
      return types.identifier('undefined');
    case 'string':
      return types.stringLiteral(json);
    case 'number':
      return types.numericLiteral(json);
    case 'boolean':
      return types.booleanLiteral(json);
    case 'object':
      if (!json) {
        return types.nullLiteral();
      }
      if (Array.isArray(json)) {
        return arrayToAst(json);
      }
      return jsonObjectToAst(json as JSONObject);
  }
};

const jsonObjectToAst = (
  json: JSONOrNodeObject,
): babel.types.ObjectExpression => {
  if (!json) {
    return json;
  }
  const properties: babel.types.ObjectProperty[] = [];
  for (const key in json) {
    const value = json[key];
    if (value === undefined) {
      continue;
    }
    const keyAst = types.stringLiteral(key);
    const valueAst = jsonToAst(value);
    properties.push(types.objectProperty(keyAst, valueAst as any));
  }
  const newNode = types.objectExpression(properties);

  return newNode;
};

// For simple single string templates = aka
// createSimpleTemplateLiteral('string') -> `string`
const createSimpleTemplateLiteral = (str: string) => {
  return types.templateLiteral([types.templateElement({ raw: str })], []);
};

const createFunctionStringLiteral = (node: babel.types.Node) => {
  return types.stringLiteral(`${functionLiteralPrefix}${generate(node).code}`);
};
const createFunctionStringLiteralObjectProperty = (
  key: babel.types.Expression,
  node: babel.types.Node,
) => {
  return types.objectProperty(key, createFunctionStringLiteral(node));
};

const componentFunctionToJson = (
  node: babel.types.FunctionDeclaration,
  context: Context,
): JSONOrNode => {
  let state = {};
  for (const item of node.body.body) {
    if (types.isVariableDeclaration(item)) {
      const init = item.declarations[0].init;
      if (types.isCallExpression(init)) {
        const firstArg = init.arguments[0];
        if (types.isObjectExpression(firstArg)) {
          const properties = firstArg.properties;
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
            obj = JSON5.parse(code);
          } catch (err) {
            console.error('Could not JSON5 parse object:\n', code);
            throw err;
          }
          state = obj;
        }
      }
    }
  }

  const theReturn = node.body.body.find((item) =>
    types.isReturnStatement(item),
  );
  const children: JSXLiteNode[] = [];
  if (theReturn) {
    const value = (theReturn as babel.types.ReturnStatement).argument;
    if (types.isJSXElement(value)) {
      children.push(jsxElementToJson(value) as JSXLiteNode);
    }
  }

  return {
    ...context.builder.component,
    state,
    children,
  } as any;
};

const jsxElementToJson = (
  node:
    | babel.types.JSXElement
    | babel.types.JSXText
    | babel.types.JSXExpressionContainer,
): JSXLiteNode => {
  if (types.isJSXText(node)) {
    return createJSXLiteNode({
      properties: {
        _text: node.value,
      },
    });
  }
  if (types.isJSXExpressionContainer(node)) {
    return createJSXLiteNode({
      bindings: {
        _text: generate(node.expression).code,
      },
    });
  }

  const nodeName = (node.openingElement.name as babel.types.JSXIdentifier).name;

  if (nodeName === 'Show') {
    const whenAttr:
      | babel.types.JSXAttribute
      | undefined = node.openingElement.attributes.find(
      (item) => types.isJSXAttribute(item) && item.name.name === 'when',
    ) as any;
    const whenValue =
      whenAttr &&
      types.isJSXExpressionContainer(whenAttr.value) &&
      generate(whenAttr.value.expression).code;

    return createJSXLiteNode({
      name: 'Show',
      bindings: {
        _when: whenValue,
      },
      children: node.children.map((item) =>
        jsxElementToJson(item as any),
      ) as any,
    });
  }

  if (nodeName === 'For') {
    const child = node.children.find((item) =>
      types.isJSXExpressionContainer(item),
    );
    if (types.isJSXExpressionContainer(child)) {
      const childExpression = child.expression;

      if (types.isArrowFunctionExpression(childExpression)) {
        const argName = (childExpression.params[0] as babel.types.Identifier)
          .name;
        return createJSXLiteNode({
          name: 'For',
          bindings: {
            _forEach: generate(
              ((node.openingElement.attributes[0] as babel.types.JSXAttribute)
                .value as babel.types.JSXExpressionContainer).expression,
            ).code,
            _forName: argName,
          },
          children: [jsxElementToJson(childExpression.body as any)],
        });
      }
    }
  }

  return createJSXLiteNode({
    name: nodeName,
    properties: node.openingElement.attributes.reduce((memo, item) => {
      if (types.isJSXAttribute(item)) {
        const key = item.name.name as string;
        const value = item.value;
        if (types.isStringLiteral(value)) {
          memo[key] = value;
          return memo;
        }
      }
      return memo;
    }, {} as { [key: string]: JSONOrNode }) as any,
    bindings: node.openingElement.attributes.reduce((memo, item) => {
      if (types.isJSXAttribute(item)) {
        const key = item.name.name as string;
        const value = item.value;

        if (types.isJSXExpressionContainer(value)) {
          const { expression } = value;
          if (types.isArrowFunctionExpression(expression)) {
            memo[key] = generate(expression.body).code;
          } else {
            memo[key] = generate(expression).code;
          }
          return memo;
        }
      } else if (types.isJSXSpreadAttribute(item)) {
        // TODO: potentially like Vue store bindings and properties as array of key value pairs
        // too so can do this accurately when order matters. Also tempting to not support spread,
        // as some frameworks do not support it (e.g. Angular) tho Angular may be the only one
        memo._spread = types.stringLiteral(generate(item.argument).code);
      }
      return memo;
    }, {} as { [key: string]: JSONOrNode }) as any,
    children: node.children.map((item) => jsxElementToJson(item as any)) as any,
  });
};

export function parse(jsx: string): JSXLiteComponent {
  const output = babel.transform(jsx, {
    presets: [[tsPreset, { isTSX: true, allExtensions: true }]],
    plugins: [
      jsxPlugin,
      () => ({
        visitor: {
          Program(path: babel.NodePath<babel.types.Program>, context: Context) {
            if (context.builder) {
              return;
            }
            context.builder = {
              component: createJSXLiteComponent(),
            };

            const isImportOrDefaultExport = (node: babel.Node) =>
              types.isExportDefaultDeclaration(node) ||
              types.isImportDeclaration(node);

            const keepStatements = path.node.body.filter((statement) =>
              isImportOrDefaultExport(statement),
            );
            const cutStatements = path.node.body.filter(
              (statement) => !isImportOrDefaultExport(statement),
            );

            // TODO: support multiple? e.g. for others to add imports?
            context.builder.component.hooks.preComponent = generate(
              types.program(cutStatements),
            ).code;

            path.replaceWith(types.program(keepStatements));
          },
          FunctionDeclaration(
            path: babel.NodePath<babel.types.FunctionDeclaration>,
            context: Context,
          ) {
            const { node } = path;
            if (types.isIdentifier(node.id)) {
              const name = node.id.name;
              if (name[0].toUpperCase() === name[0]) {
                path.replaceWith(
                  jsonToAst(componentFunctionToJson(node, context)),
                );
              }
            }
          },
          ImportDeclaration(
            path: babel.NodePath<babel.types.ImportDeclaration>,
            context: Context,
          ) {
            // @jsx-lite/core imports compile away. yeehaw
            if (path.node.source.value == '@jsx-lite/core') {
              path.remove();
              return;
            }
            const importObject: JSXLiteImport = {
              imports: {},
              path: path.node.source.value,
            };
            for (const specifier of path.node.specifiers) {
              if (types.isImportSpecifier(specifier)) {
                importObject.imports[
                  (specifier.imported as babel.types.Identifier).name
                ] = specifier.local.name;
              } else if (types.isImportDefaultSpecifier(specifier)) {
                importObject.imports[specifier.local.name] = 'default';
              } else if (types.isImportNamespaceSpecifier(specifier)) {
                importObject.imports[specifier.local.name] = '*';
              }
            }
            context.builder.component.imports.push(importObject);

            path.remove();
          },
          ExportDefaultDeclaration(
            path: babel.NodePath<babel.types.ExportDefaultDeclaration>,
          ) {
            path.replaceWith(path.node.declaration);
          },
          JSXElement(path: babel.NodePath<babel.types.JSXElement>) {
            const { node } = path;
            path.replaceWith(jsonToAst(jsxElementToJson(node)));
          },
        },
      }),
    ],
  });

  try {
    return JSON5.parse(
      output!.code!.trim().replace(/^\({/, '{').replace(/}\);$/, '}'),
    );
  } catch (err) {
    console.error('Could not parse code', output && output.code);
    throw err;
  }
}
