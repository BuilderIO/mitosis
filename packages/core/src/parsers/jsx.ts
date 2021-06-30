import * as babel from '@babel/core';
import generate from '@babel/generator';
import JSON5 from 'json5';
import { JSXLiteNode } from '../types/jsx-lite-node';
import { JSONObject, JSONOrNode, JSONOrNodeObject } from '../types/json';
import { createJSXLiteNode } from '../helpers/create-jsx-lite-node';
import { JSXLiteComponent, JSXLiteImport } from '../types/jsx-lite-component';
import { createJSXLiteComponent } from '../helpers/create-jsx-lite-component';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { stripNewlinesInStrings } from '../helpers/replace-new-lines-in-strings';
import traverse from 'traverse';
import { isJsxLiteNode } from '../helpers/is-jsx-lite-node';
import { replaceIdentifiers } from '../helpers/replace-idenifiers';
import { babelTransformExpression } from '../helpers/babel-transform';
import { capitalize } from '../helpers/capitalize';

const jsxPlugin = require('@babel/plugin-syntax-jsx');
const tsPreset = require('@babel/preset-typescript');

export const selfClosingTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

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

export const createFunctionStringLiteral = (node: babel.types.Node) => {
  return types.stringLiteral(`${functionLiteralPrefix}${generate(node).code}`);
};
export const createFunctionStringLiteralObjectProperty = (
  key: babel.types.Expression,
  node: babel.types.Node,
) => {
  return types.objectProperty(key, createFunctionStringLiteral(node));
};

const uncapitalize = (str: string) => {
  if (!str) {
    return str;
  }

  return str[0].toLowerCase() + str.slice(1);
};

export const parseStateObject = (object: babel.types.ObjectExpression) => {
  const properties = object.properties;
  const useProperties = properties.map((item) => {
    if (types.isObjectProperty(item)) {
      if (
        types.isFunctionExpression(item.value) ||
        types.isArrowFunctionExpression(item.value)
      ) {
        return createFunctionStringLiteralObjectProperty(item.key, item.value);
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
  return obj;
};

const parseJson = (node: babel.types.Node) => {
  let code: string | undefined;
  try {
    code = generate(node).code!;
    return JSON5.parse(code);
  } catch (err) {
    console.error('Could not JSON5 parse object:\n', code);
    throw err;
  }
};

const componentFunctionToJson = (
  node: babel.types.FunctionDeclaration,
  context: Context,
): JSONOrNode => {
  const hooks: JSXLiteComponent['hooks'] = {};
  let state: JSONObject = {};
  for (const item of node.body.body) {
    if (types.isExpressionStatement(item)) {
      const expression = item.expression;
      if (types.isCallExpression(expression)) {
        if (types.isIdentifier(expression.callee)) {
          if (
            expression.callee.name === 'onMount' ||
            expression.callee.name === 'useEffect'
          ) {
            const firstArg = expression.arguments[0];
            if (
              types.isFunctionExpression(firstArg) ||
              types.isArrowFunctionExpression(firstArg)
            ) {
              hooks.onMount = generate(firstArg.body)
                .code.trim()
                // Remove abtrary block wrapping if any
                // AKA
                //  { console.log('hi') } -> console.log('hi')
                .replace(/^{/, '')
                .replace(/}$/, '');
            }
          }
        }
      }
    }

    if (types.isFunctionDeclaration(item)) {
      if (types.isIdentifier(item.id)) {
        state[item.id.name] = `${functionLiteralPrefix}${generate(item).code!}`;
      }
    }

    if (types.isVariableDeclaration(item)) {
      const declaration = item.declarations[0];
      const init = declaration.init;
      if (types.isCallExpression(init)) {
        // React format, like:
        // const [foo, setFoo] = useState(...)
        if (types.isArrayPattern(declaration.id)) {
          const varName =
            types.isIdentifier(declaration.id.elements[0]) &&
            declaration.id.elements[0].name;
          if (varName) {
            const value = init.arguments[0];
            // Function as init, like:
            // useState(() => true)
            if (types.isArrowFunctionExpression(value)) {
              state[varName] = parseJson(value.body);
            } else {
              // Value as init, like:
              // useState(true)
              state[varName] = parseJson(value);
            }
          }
        }
        // Legacy format, like:
        // const state = useState({...})
        else if (types.isIdentifier(init.callee)) {
          if (init.callee.name === 'useState') {
            const firstArg = init.arguments[0];
            if (types.isObjectExpression(firstArg)) {
              state = parseStateObject(firstArg);
            }
          }
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
    if (types.isJSXElement(value) || types.isJSXFragment(value)) {
      children.push(jsxElementToJson(value) as JSXLiteNode);
    }
  }

  return createJSXLiteComponent({
    ...context.builder.component,
    name: node.id?.name,
    state,
    children,
    hooks,
  }) as any;
};

const jsxElementToJson = (
  node:
    | babel.types.JSXElement
    | babel.types.JSXText
    | babel.types.JSXFragment
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
    // foo.map -> <For each={foo}>...</For>
    if (types.isCallExpression(node.expression)) {
      const callback = node.expression.arguments[0];
      if (types.isArrowFunctionExpression(callback)) {
        if (types.isIdentifier(callback.params[0])) {
          const forName = callback.params[0].name;

          return createJSXLiteNode({
            name: 'For',
            bindings: {
              each: generate(node.expression.callee).code.slice(0, -4),
              _forName: forName,
            },
            children: [jsxElementToJson(callback.body as any)],
          });
        }
      }
    }

    // {foo && <div />} -> <Show when={foo}>...</Show>
    if (types.isLogicalExpression(node.expression)) {
      if (node.expression.operator === '&&') {
        return createJSXLiteNode({
          name: 'Show',
          bindings: {
            when: generate(node.expression.left).code!,
          },
          children: [jsxElementToJson(node.expression.right as any)],
        });
      } else {
        // TODO: good warning system for unsupported operators
      }
    }

    // TODO: support {foo ? bar : baz}

    return createJSXLiteNode({
      bindings: {
        _text: generate(node.expression).code,
      },
    });
  }

  if (types.isJSXFragment(node)) {
    return createJSXLiteNode({
      name: 'Fragment',
      children: node.children.map((item) =>
        jsxElementToJson(item as any),
      ) as any,
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
        when: whenValue || undefined,
      },
      children: node.children.map((item) =>
        jsxElementToJson(item as any),
      ) as any,
    });
  }

  // <For ...> control flow component
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
            each: generate(
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

const getHook = (node: babel.Node) => {
  const item = node;
  if (types.isExpressionStatement(item)) {
    const expression = item.expression;
    if (types.isCallExpression(expression)) {
      if (types.isIdentifier(expression.callee)) {
        if (expression.callee.name.match(/^use[A-Z0-9]/)) {
          return expression;
        }
      }
    }
  }
  return null;
};

export const METADATA_HOOK_NAME = 'useMetadata';

/**
 * Transform useMetadata({...}) onto the component JSON as
 * meta: { metadataHook: { ... }}
 *
 * This function collects metadata and removes the statement from
 * the returned nodes array
 */
const collectMetadata = (
  nodes: babel.types.Statement[],
  component: JSXLiteComponent,
) => {
  return nodes.filter((node) => {
    const hook = getHook(node);
    if (!hook) {
      return true;
    }
    if (
      types.isIdentifier(hook.callee) &&
      hook.callee.name === METADATA_HOOK_NAME
    ) {
      component.meta.metadataHook = JSON5.parse(
        generate(hook.arguments[0]).code,
      );
      return false;
    }
    return true;
  });
};

type ParseJSXLiteOptions = {
  format: 'react' | 'simple';
};

function mapReactIdentifiersInExpression(
  expression: string,
  stateProperties: string[],
) {
  const setExpressions = stateProperties.map(
    (propertyName) => `set${capitalize(propertyName)}`,
  );

  return babelTransformExpression(
    // foo -> state.foo
    replaceIdentifiers(expression, stateProperties, (name) => `state.${name}`),
    {
      CallExpression(path: babel.NodePath<babel.types.CallExpression>) {
        if (types.isIdentifier(path.node.callee)) {
          if (setExpressions.includes(path.node.callee.name)) {
            // setFoo -> foo
            const statePropertyName = uncapitalize(
              path.node.callee.name.slice(3),
            );

            // setFoo(...) -> state.foo = ...
            path.replaceWith(
              types.assignmentExpression(
                '=',
                types.identifier(`state.${statePropertyName}`),
                path.node.arguments[0] as any,
              ),
            );
          }
        }
      },
    },
  );
}

/**
 * Convert state identifiers from React hooks format to the state.* format JSX Lite needs
 * e.g.
 *   text -> state.text
 *   setText(...) -> state.text = ...
 */
function mapReactIdentifiers(json: JSXLiteComponent) {
  const stateProperties = Object.keys(json.state);

  for (const key in json.state) {
    const value = json.state[key];
    if (typeof value === 'string' && value.startsWith(functionLiteralPrefix)) {
      json.state[key] =
        functionLiteralPrefix +
        mapReactIdentifiersInExpression(
          value.replace(functionLiteralPrefix, ''),
          stateProperties,
        );
    }
  }

  traverse(json).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      for (const key in item.bindings) {
        const value = item.bindings[key];
        if (value) {
          item.bindings[key] = mapReactIdentifiersInExpression(
            value,
            stateProperties,
          );
        }
      }
    }
  });
}

export function parseJsx(
  jsx: string,
  options: Partial<ParseJSXLiteOptions> = {},
): JSXLiteComponent {
  const useOptions: ParseJSXLiteOptions = {
    format: 'react',
    ...options,
  };

  let subComponentFunctions: string[] = [];

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
            let cutStatements = path.node.body.filter(
              (statement) => !isImportOrDefaultExport(statement),
            );

            subComponentFunctions = path.node.body
              .filter(
                (node) =>
                  !types.isExportDefaultDeclaration(node) &&
                  types.isFunctionDeclaration(node),
              )
              .map((node) => `export default ${generate(node).code!}`);

            cutStatements = collectMetadata(
              cutStatements,
              context.builder.component,
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
            // @jsx-lite/core or React imports compile away
            if (
              ['react', '@jsx-lite/core', '@emotion/react'].includes(
                path.node.source.value,
              )
            ) {
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
  let parsed: JSXLiteComponent;
  try {
    parsed = JSON5.parse(toParse);
  } catch (err) {
    debugger;
    console.error('Could not parse code', toParse);
    throw err;
  }

  mapReactIdentifiers(parsed);

  parsed.subComponents = subComponentFunctions.map((item) =>
    parseJsx(item, useOptions),
  );

  return parsed;
}
