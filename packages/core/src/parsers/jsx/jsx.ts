import * as babel from '@babel/core';
import generate from '@babel/generator';
import { traceReferenceToModulePath } from '../../helpers/trace-reference-to-module-path';
import { functionLiteralPrefix } from '../../constants/function-literal-prefix';
import { createMitosisComponent } from '../../helpers/create-mitosis-component';
import { createMitosisNode } from '../../helpers/create-mitosis-node';
import { getBindingsCode } from '../../helpers/get-bindings';
import { stripNewlinesInStrings } from '../../helpers/replace-new-lines-in-strings';
import { JSONObject, JSONOrNode } from '../../types/json';
import { MitosisComponent, MitosisImport, MitosisExport } from '../../types/mitosis-component';
import { MitosisNode } from '../../types/mitosis-node';
import { tryParseJson } from '../../helpers/json';
import { HOOKS } from '../../constants/hooks';
import { jsonToAst } from './ast';
import { mapReactIdentifiers, parseStateObject } from './state';
import { Context, ParseMitosisOptions } from './types';
import { collectMetadata } from './metadata';
import { extractContextComponents } from './context';
import { parseCodeJson } from './helpers';
import {
  collectInterfaces,
  collectTypes,
  getPropsTypeRef,
  isTypeOrInterface,
} from './component-types';
import { undoPropsDestructure } from './props';

const jsxPlugin = require('@babel/plugin-syntax-jsx');
const tsPreset = require('@babel/preset-typescript');

const { types } = babel;

const componentFunctionToJson = (
  node: babel.types.FunctionDeclaration,
  context: Context,
): JSONOrNode => {
  const hooks: MitosisComponent['hooks'] = {};
  let state: MitosisComponent['state'] = {};
  const accessedContext: MitosisComponent['context']['get'] = {};
  const setContext: MitosisComponent['context']['set'] = {};
  const refs: MitosisComponent['refs'] = {};
  for (const item of node.body.body) {
    if (types.isExpressionStatement(item)) {
      const expression = item.expression;
      if (types.isCallExpression(expression)) {
        if (types.isIdentifier(expression.callee)) {
          if (
            expression.callee.name === 'setContext' ||
            expression.callee.name === 'provideContext'
          ) {
            const keyNode = expression.arguments[0];
            if (types.isIdentifier(keyNode)) {
              const key = keyNode.name;
              const keyPath = traceReferenceToModulePath(context.builder.component.imports, key)!;
              const valueNode = expression.arguments[1];
              if (valueNode) {
                if (types.isObjectExpression(valueNode)) {
                  const value = parseStateObject(valueNode) as JSONObject;
                  setContext[keyPath] = {
                    name: keyNode.name,
                    value,
                  };
                } else {
                  const ref = generate(valueNode).code;
                  setContext[keyPath] = {
                    name: keyNode.name,
                    ref,
                  };
                }
              }
            }
          } else if (
            expression.callee.name === 'onMount' ||
            expression.callee.name === 'useEffect'
          ) {
            const firstArg = expression.arguments[0];
            if (types.isFunctionExpression(firstArg) || types.isArrowFunctionExpression(firstArg)) {
              const code = generate(firstArg.body)
                .code.trim()
                // Remove arbitrary block wrapping if any
                // AKA
                //  { console.log('hi') } -> console.log('hi')
                .replace(/^{/, '')
                .replace(/}$/, '');
              // TODO: add arguments
              hooks.onMount = { code };
            }
          } else if (expression.callee.name === 'onUpdate') {
            const firstArg = expression.arguments[0];
            const secondArg = expression.arguments[1];
            if (types.isFunctionExpression(firstArg) || types.isArrowFunctionExpression(firstArg)) {
              const code = generate(firstArg.body)
                .code.trim()
                // Remove arbitrary block wrapping if any
                // AKA
                //  { console.log('hi') } -> console.log('hi')
                .replace(/^{/, '')
                .replace(/}$/, '');
              if (
                !secondArg ||
                (types.isArrayExpression(secondArg) && secondArg.elements.length > 0)
              ) {
                const depsCode = secondArg ? generate(secondArg).code : '';

                hooks.onUpdate = [
                  ...(hooks.onUpdate || []),
                  {
                    code,
                    deps: depsCode,
                  },
                ];
              }
            }
          } else if (expression.callee.name === 'onUnMount') {
            const firstArg = expression.arguments[0];
            if (types.isFunctionExpression(firstArg) || types.isArrowFunctionExpression(firstArg)) {
              const code = generate(firstArg.body)
                .code.trim()
                // Remove arbitrary block wrapping if any
                // AKA
                //  { console.log('hi') } -> console.log('hi')
                .replace(/^{/, '')
                .replace(/}$/, '');
              hooks.onUnMount = { code };
            }
          } else if (expression.callee.name === 'onInit') {
            const firstArg = expression.arguments[0];
            if (types.isFunctionExpression(firstArg) || types.isArrowFunctionExpression(firstArg)) {
              const code = generate(firstArg.body)
                .code.trim()
                // Remove arbitrary block wrapping if any
                // AKA
                //  { console.log('hi') } -> console.log('hi')
                .replace(/^{/, '')
                .replace(/}$/, '');
              hooks.onInit = { code };
            }
          }
        }
      }
    }

    if (types.isFunctionDeclaration(item)) {
      if (types.isIdentifier(item.id)) {
        state[item.id.name] = {
          code: `${functionLiteralPrefix}${generate(item).code!}`,
          type: 'function',
        };
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
            types.isIdentifier(declaration.id.elements[0]) && declaration.id.elements[0].name;
          if (varName) {
            const value = init.arguments[0];
            // Function as init, like:
            // useState(() => true)
            if (types.isArrowFunctionExpression(value)) {
              state[varName] = {
                code: parseCodeJson(value.body),
                type: 'function',
              };
            } else {
              // Value as init, like:
              // useState(true)
              state[varName] = {
                code: parseCodeJson(value),
                type: 'data',
              };
            }
          }
        }
        // Legacy format, like:
        // const state = useStore({...})
        else if (types.isIdentifier(init.callee)) {
          if (init.callee.name === HOOKS.STATE || init.callee.name === HOOKS.STORE) {
            const firstArg = init.arguments[0];
            if (types.isObjectExpression(firstArg)) {
              Object.assign(state, parseStateObject(firstArg));
            }
          } else if (init.callee.name === HOOKS.CONTEXT) {
            const firstArg = init.arguments[0];
            if (types.isVariableDeclarator(declaration) && types.isIdentifier(declaration.id)) {
              if (types.isIdentifier(firstArg)) {
                const varName = declaration.id.name;
                const name = firstArg.name;
                accessedContext[varName] = {
                  name,
                  path: traceReferenceToModulePath(context.builder.component.imports, name)!,
                };
              } else {
                const varName = declaration.id.name;
                const name = generate(firstArg).code;
                accessedContext[varName] = {
                  name,
                  path: '',
                };
              }
            }
          } else if (init.callee.name === HOOKS.REF) {
            if (types.isIdentifier(declaration.id)) {
              const firstArg = init.arguments[0];
              const varName = declaration.id.name;
              refs[varName] = {
                argument: generate(firstArg).code,
              };
              // Typescript Parameter
              if (types.isTSTypeParameterInstantiation(init.typeParameters)) {
                refs[varName].typeParameter = generate(init.typeParameters.params[0]).code;
              }
            }
          }
        }
      }
    }
  }

  const theReturn = node.body.body.find((item) => types.isReturnStatement(item));
  const children: MitosisNode[] = [];
  if (theReturn) {
    const value = (theReturn as babel.types.ReturnStatement).argument;
    if (types.isJSXElement(value) || types.isJSXFragment(value)) {
      children.push(jsxElementToJson(value) as MitosisNode);
    }
  }

  const { exports: localExports } = context.builder.component;
  if (localExports) {
    const bindingsCode = getBindingsCode(children);
    Object.keys(localExports).forEach((name) => {
      const found = bindingsCode.find((code: string) => code.match(new RegExp(`\\b${name}\\b`)));
      localExports[name].usedInLocal = Boolean(found);
    });
    context.builder.component.exports = localExports;
  }

  return createMitosisComponent({
    ...context.builder.component,
    name: node.id?.name,
    state,
    children,
    refs: refs,
    hooks,
    context: {
      get: accessedContext,
      set: setContext,
    },
    propsTypeRef: getPropsTypeRef(node),
  }) as any;
};

const jsxElementToJson = (
  node:
    | babel.types.JSXElement
    | babel.types.JSXText
    | babel.types.JSXFragment
    | babel.types.JSXExpressionContainer,
): MitosisNode | null => {
  if (types.isJSXText(node)) {
    return createMitosisNode({
      properties: {
        _text: node.value,
      },
    });
  }
  if (types.isJSXExpressionContainer(node)) {
    if (types.isJSXEmptyExpression(node.expression)) {
      return null;
    }
    // foo.map -> <For each={foo}>...</For>
    if (
      types.isCallExpression(node.expression) ||
      types.isOptionalCallExpression(node.expression)
    ) {
      const callback = node.expression.arguments[0];
      if (types.isArrowFunctionExpression(callback)) {
        if (types.isIdentifier(callback.params[0])) {
          const forArguments = callback.params
            .map((param) => (param as babel.types.Identifier)?.name)
            .filter(Boolean);
          return createMitosisNode({
            name: 'For',
            bindings: {
              each: {
                code: generate(node.expression.callee)
                  .code // Remove .map or potentially ?.map
                  .replace(/\??\.map$/, ''),
              },
            },
            scope: {
              For: forArguments,
            },
            properties: {
              _forName: forArguments[0],
              _indexName: forArguments[1],
              _collectionName: forArguments[2],
            },
            children: [jsxElementToJson(callback.body as any)!],
          });
        }
      }
    }

    // {foo && <div />} -> <Show when={foo}>...</Show>
    if (types.isLogicalExpression(node.expression)) {
      if (node.expression.operator === '&&') {
        return createMitosisNode({
          name: 'Show',
          bindings: {
            when: { code: generate(node.expression.left).code! },
          },
          children: [jsxElementToJson(node.expression.right as any)!],
        });
      } else {
        // TODO: good warning system for unsupported operators
      }
    }

    // {foo ? <div /> : <span />} -> <Show when={foo} else={<span />}>...</Show>
    if (types.isConditionalExpression(node.expression)) {
      return createMitosisNode({
        name: 'Show',
        meta: {
          else: jsxElementToJson(node.expression.alternate as any)!,
        },
        bindings: {
          when: { code: generate(node.expression.test).code! },
        },
        children: [jsxElementToJson(node.expression.consequent as any)!],
      });
    }

    // TODO: support {foo ? bar : baz}

    return createMitosisNode({
      bindings: {
        _text: { code: generate(node.expression).code },
      },
    });
  }

  if (types.isJSXFragment(node)) {
    return createMitosisNode({
      name: 'Fragment',
      children: node.children.map((item) => jsxElementToJson(item as any)).filter(Boolean) as any,
    });
  }

  const nodeName = generate(node.openingElement.name).code;

  if (nodeName === 'Show') {
    const whenAttr: babel.types.JSXAttribute | undefined = node.openingElement.attributes.find(
      (item) => types.isJSXAttribute(item) && item.name.name === 'when',
    ) as any;

    const elseAttr: babel.types.JSXAttribute | undefined = node.openingElement.attributes.find(
      (item) => types.isJSXAttribute(item) && item.name.name === 'else',
    ) as any;

    const whenValue =
      whenAttr && types.isJSXExpressionContainer(whenAttr.value)
        ? generate(whenAttr.value.expression).code
        : undefined;

    const elseValue =
      elseAttr &&
      types.isJSXExpressionContainer(elseAttr.value) &&
      jsxElementToJson(elseAttr.value.expression as any);

    return createMitosisNode({
      name: 'Show',
      meta: {
        else: elseValue || undefined,
      },
      bindings: {
        ...(whenValue ? { when: { code: whenValue } } : {}),
      },
      children: node.children.map((item) => jsxElementToJson(item as any)).filter(Boolean) as any,
    });
  }

  // <For ...> control flow component
  if (nodeName === 'For') {
    const child = node.children.find((item) => types.isJSXExpressionContainer(item));
    if (types.isJSXExpressionContainer(child)) {
      const childExpression = child.expression;

      if (types.isArrowFunctionExpression(childExpression)) {
        const forArguments = childExpression?.params
          .map((param) => (param as babel.types.Identifier)?.name)
          .filter(Boolean);

        return createMitosisNode({
          name: 'For',
          bindings: {
            each: {
              code: generate(
                (
                  (node.openingElement.attributes[0] as babel.types.JSXAttribute)
                    .value as babel.types.JSXExpressionContainer
                ).expression,
              ).code,
            },
          },
          scope: {
            For: forArguments,
          },
          properties: {
            _forName: forArguments[0],
            _indexName: forArguments[1],
            _collectionName: forArguments[2],
          },
          children: [jsxElementToJson(childExpression.body as any)!],
        });
      }
    }
  }

  return createMitosisNode({
    name: nodeName,
    properties: node.openingElement.attributes.reduce((memo, item) => {
      if (types.isJSXAttribute(item)) {
        const key = item.name.name as string;
        const value = item.value;
        if (types.isStringLiteral(value)) {
          memo[key] = value;
          return memo;
        }
        if (types.isJSXExpressionContainer(value) && types.isStringLiteral(value.expression)) {
          memo[key] = value.expression.value;
          return memo;
        }
      }
      return memo;
    }, {} as { [key: string]: JSONOrNode }) as any,
    bindings: node.openingElement.attributes.reduce((memo, item) => {
      if (types.isJSXAttribute(item)) {
        const key = item.name.name as string;
        const value = item.value;

        if (types.isJSXExpressionContainer(value) && !types.isStringLiteral(value.expression)) {
          const { expression } = value;
          if (types.isArrowFunctionExpression(expression)) {
            if (key.startsWith('on')) {
              memo[key] = {
                code: generate(expression.body).code,
                arguments: expression.params.map((node) => (node as babel.types.Identifier)?.name),
              };
            } else {
              memo[key] = { code: generate(expression.body).code };
            }
          } else {
            memo[key] = { code: generate(expression).code };
          }

          return memo;
        }
      } else if (types.isJSXSpreadAttribute(item)) {
        // TODO: potentially like Vue store bindings and properties as array of key value pairs
        // too so can do this accurately when order matters. Also tempting to not support spread,
        // as some frameworks do not support it (e.g. Angular) tho Angular may be the only one
        memo._spread = {
          code: types.stringLiteral(generate(item.argument).code),
        };
      }
      return memo;
    }, {} as { [key: string]: JSONOrNode }) as any,
    children: node.children.map((item) => jsxElementToJson(item as any)).filter(Boolean) as any,
  });
};

const isImportOrDefaultExport = (node: babel.Node) =>
  types.isExportDefaultDeclaration(node) || types.isImportDeclaration(node);

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
    presets: [[tsPreset, { isTSX: true, allExtensions: true }]],
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

            const exportsOrLocalVariables = path.node.body.filter(
              (statement) =>
                !isImportOrDefaultExport(statement) &&
                !isTypeOrInterface(statement) &&
                !types.isExpressionStatement(statement),
            );

            context.builder.component.exports = exportsOrLocalVariables.reduce((pre, node) => {
              let name, isFunction;
              if (babel.types.isExportNamedDeclaration(node)) {
                if (
                  babel.types.isVariableDeclaration(node.declaration) &&
                  babel.types.isIdentifier(node.declaration.declarations[0].id)
                ) {
                  name = node.declaration.declarations[0].id.name;
                  isFunction = babel.types.isFunction(node.declaration.declarations[0].init);
                }

                if (babel.types.isFunctionDeclaration(node.declaration)) {
                  name = node.declaration.id?.name;
                  isFunction = true;
                }
              } else {
                if (
                  babel.types.isVariableDeclaration(node) &&
                  babel.types.isIdentifier(node.declarations[0].id)
                ) {
                  name = node.declarations[0].id.name;
                  isFunction = babel.types.isFunction(node.declarations[0].init);
                }

                if (babel.types.isFunctionDeclaration(node)) {
                  name = node.id?.name;
                  isFunction = true;
                }
              }

              if (name) {
                pre[name] = {
                  code: generate(node).code,
                  isFunction,
                };
              } else {
                console.warn('Could not parse export or variable: ignoring node', node);
              }
              return pre;
            }, {} as MitosisExport);

            let cutStatements = path.node.body.filter(
              (statement) => !isImportOrDefaultExport(statement),
            );

            subComponentFunctions = path.node.body
              .filter(
                (node) =>
                  !types.isExportDefaultDeclaration(node) && types.isFunctionDeclaration(node),
              )
              .map((node) => `export default ${generate(node).code!}`);

            cutStatements = collectMetadata(cutStatements, context.builder.component, useOptions);

            // TODO: support multiple? e.g. for others to add imports?
            context.builder.component.hooks.preComponent = {
              code: generate(types.program(cutStatements)).code,
            };

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
            // @builder.io/mitosis or React imports compile away
            const customPackages = options?.compileAwayPackages || [];
            if (
              ['react', '@builder.io/mitosis', '@emotion/react', ...customPackages].includes(
                path.node.source.value,
              )
            ) {
              path.remove();
              return;
            }
            const importObject: MitosisImport = {
              imports: {},
              path: path.node.source.value,
            };
            for (const specifier of path.node.specifiers) {
              if (types.isImportSpecifier(specifier)) {
                importObject.imports[specifier.local.name] = (
                  specifier.imported as babel.types.Identifier
                ).name;
              } else if (types.isImportDefaultSpecifier(specifier)) {
                importObject.imports[specifier.local.name] = 'default';
              } else if (types.isImportNamespaceSpecifier(specifier)) {
                importObject.imports[specifier.local.name] = '*';
              }
            }
            context.builder.component.imports.push(importObject);

            path.remove();
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
            const newTypeStr = generate(node).code;
            if (babel.types.isTSInterfaceDeclaration(node.declaration)) {
              collectInterfaces(path.node, context);
            }
            if (babel.types.isTSTypeAliasDeclaration(node.declaration)) {
              collectTypes(path.node, context);
            }
          },
          TSTypeAliasDeclaration(path, context) {
            collectTypes(path.node, context);
          },
          TSInterfaceDeclaration(path, context) {
            collectInterfaces(path.node, context);
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

  mapReactIdentifiers(parsed);
  extractContextComponents(parsed);

  parsed.subComponents = subComponentFunctions.map((item) => parseJsx(item, useOptions));

  return parsed;
}
