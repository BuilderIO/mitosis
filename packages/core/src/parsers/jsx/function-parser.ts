import * as babel from '@babel/core';
import generate from '@babel/generator';
import { traceReferenceToModulePath } from '../../helpers/trace-reference-to-module-path';
import { createMitosisComponent } from '../../helpers/create-mitosis-component';
import { getBindingsCode } from '../../helpers/get-bindings';
import { JSONOrNode } from '../../types/json';
import { MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode } from '../../types/mitosis-node';
import { HOOKS } from '../../constants/hooks';
import { parseStateObjectToMitosisState } from './state';
import { Context } from './types';
import { parseCodeJson } from './helpers';
import { getPropsTypeRef } from './component-types';
import { jsxElementToJson } from './element-parser';

const { types } = babel;

/**
 * Parses function declarations within the Mitosis copmonent's body to JSON
 */
export const componentFunctionToJson = (
  node: babel.types.FunctionDeclaration,
  context: Context,
): JSONOrNode => {
  const hooks: MitosisComponent['hooks'] = {};
  const state: MitosisComponent['state'] = {};
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
                  const value = parseStateObjectToMitosisState(valueNode);
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
          } else if (expression.callee.name === HOOKS.DEFAULT_PROPS) {
            const firstArg = expression.arguments[0];
            if (types.isObjectExpression(firstArg)) {
              const objectProperties = firstArg.properties?.filter((i) =>
                types.isObjectProperty(i),
              );
              objectProperties?.forEach((i: any) => {
                if (i.key?.name) {
                  context.builder.component.defaultProps = {
                    ...(context.builder.component.defaultProps ?? {}),
                    [i.key?.name]: i.value.value,
                  };
                }
              });
            }
          }
        }
      }
    }

    if (types.isFunctionDeclaration(item)) {
      if (types.isIdentifier(item.id)) {
        state[item.id.name] = {
          code: generate(item).code,
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
                type: 'property',
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
              const useStoreState = parseStateObjectToMitosisState(firstArg);
              Object.assign(state, useStoreState);
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

  const propsTypeRef = getPropsTypeRef(node, context);

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
    propsTypeRef,
  }) as any;
};
