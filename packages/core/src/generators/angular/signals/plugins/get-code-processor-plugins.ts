import { ToAngularOptions } from '@/generators/angular/types';
import { babelTransformExpression } from '@/helpers/babel-transform';
import { ProcessBindingOptions, processClassComponentBinding } from '@/helpers/class-components';
import { checkIsEvent } from '@/helpers/event-handlers';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { hashCodeAsString } from '@/symbols/symbol-processor';
import { MitosisComponent } from '@/types/mitosis-component';
import { ForNodeName } from '@/types/mitosis-node';
import { NodePath } from '@babel/core';
import {
  AssignmentExpression,
  BinaryExpression,
  MemberExpression,
  TemplateLiteral,
  arrowFunctionExpression,
  blockStatement,
  callExpression,
  expressionStatement,
  identifier,
  isCallExpression,
  isIdentifier,
  isIfStatement,
  isMemberExpression,
  memberExpression,
  objectExpression,
  objectProperty,
  returnStatement,
  spreadElement,
  updateExpression,
} from '@babel/types';

// Helper functions for handling nested state updates
const getBaseObject = (node: any): any => {
  if (!node) return null;
  if (!isMemberExpression(node)) return node;
  return getBaseObject(node.object);
};

const getPropertyFromStateChain = (node: any): string | null => {
  // Start at the leftmost object and traverse up to find the first property after 'state'
  let current = node;
  while (isMemberExpression(current)) {
    if (
      isMemberExpression(current.object) &&
      isIdentifier(current.object.object) &&
      current.object.object.name === 'state' &&
      isIdentifier(current.object.property)
    ) {
      return current.object.property.name;
    }
    current = current.object;
  }
  return null;
};

const getNestedPath = (node: any, topLevelProp: string): string[] => {
  const path: string[] = [];
  let current = node;

  // Collect all property names starting after the top-level property
  let foundTopLevel = false;
  while (isMemberExpression(current)) {
    if (isIdentifier(current.property)) {
      path.unshift(current.property.name);
    }

    if (
      isMemberExpression(current.object) &&
      isIdentifier(current.object.object) &&
      current.object.object.name === 'state' &&
      isIdentifier(current.object.property) &&
      current.object.property.name === topLevelProp
    ) {
      foundTopLevel = true;
      break;
    }

    current = current.object;
  }

  return foundTopLevel ? path : [];
};

const buildPathAccess = (baseParam: any, propertyPath: string[]): any => {
  return propertyPath.reduce((acc, prop) => {
    return memberExpression(acc, identifier(prop));
  }, baseParam);
};

const isStateOrPropsExpression = (path: NodePath) => {
  return (
    isMemberExpression(path.node) &&
    isIdentifier(path.node.object) &&
    isIdentifier(path.node.property) &&
    (path.node.object.name === 'props' || path.node.object.name === 'state')
  );
};

const isAFunctionOrMethod = (
  json: MitosisComponent | undefined,
  path: NodePath<MemberExpression>,
) => {
  return (
    json &&
    isIdentifier(path.node.object) &&
    isIdentifier(path.node.property) &&
    path.node.object.name === 'state' &&
    json.state &&
    typeof path.node.property.name === 'string' &&
    json.state[path.node.property.name] &&
    json.state[path.node.property.name]?.type &&
    (json.state[path.node.property.name]?.type === 'method' ||
      json.state[path.node.property.name]?.type === 'function')
  );
};

const handleAssignmentExpression = (path: NodePath<AssignmentExpression | BinaryExpression>) => {
  if (
    isMemberExpression(path.node.left) &&
    isIdentifier(path.node.left.object) &&
    isIdentifier(path.node.left.property) &&
    path.node.left.object.name === 'state'
  ) {
    const root = memberExpression(path.node.left, identifier('set'));
    root.extra = { ...root.extra, updateExpression: true };
    const call = callExpression(root, [path.node.right]);
    path.replaceWith(call);
  } else if (
    isMemberExpression(path.node.left) &&
    isMemberExpression(path.node.left.object) &&
    isIdentifier(getBaseObject(path.node.left)) &&
    getBaseObject(path.node.left).name === 'state'
  ) {
    /**
     * Handle any level of nested updates like state.store.something.nested = newVal
     * Example:
     * Input:  state.store.something.nested = newVal
     * Output: state.store.update(obj => {
     *   ...obj,
     *   store: {
     *     ...obj.store,
     *     something: {
     *       ...obj.store.something,
     *       nested: newVal
     *     }
     *   }
     * })
     */

    const stateProp = getPropertyFromStateChain(path.node.left);
    if (!stateProp) return;

    const topLevelProp = memberExpression(identifier('state'), identifier(stateProp));

    const nestedPaths = getNestedPath(path.node.left, stateProp);

    const root = memberExpression(topLevelProp, identifier('update'));
    root.extra = { ...root.extra, updateExpression: true };

    const paramName = stateProp;
    const param = identifier(paramName);

    let innerValue = path.node.right;

    for (let i = nestedPaths.length - 1; i >= 0; i--) {
      const spreadTarget = i === 0 ? param : buildPathAccess(param, nestedPaths.slice(0, i));

      innerValue = objectExpression([
        spreadElement(spreadTarget),
        objectProperty(identifier(nestedPaths[i]), innerValue, false, false),
      ]);
    }

    const arrowFunction = arrowFunctionExpression([param], innerValue, false);

    const call = callExpression(root, [arrowFunction]);
    path.replaceWith(call);
  }
};

const handleMemberExpression = (path: NodePath<MemberExpression>, json?: MitosisComponent) => {
  if (path.node.extra?.makeCallExpressionDone || path.parentPath?.node.extra?.updateExpression) {
    // Don't add a function if we've done it already
    return;
  }

  if (
    isCallExpression(path.parent) &&
    isMemberExpression(path.parent.callee) &&
    isIdentifier(path.parent.callee.object) &&
    (path.parent.callee.object.name === 'props' || path.parent.callee.object.name === 'state') &&
    !path.parent.callee.extra?.updateExpression
  ) {
    // Don't add a function if it is already
    return;
  }

  if (isStateOrPropsExpression(path)) {
    // Check if the state property is a method or function type, and if so, bind it to 'this'
    if (isAFunctionOrMethod(json, path)) {
      const bindExpr = `${path.toString()}.bind(this)`;
      path.replaceWith(identifier(bindExpr));
      return;
    }

    path.node.extra = { ...path.node.extra, makeCallExpressionDone: true };
    path.replaceWith(callExpression(path.node, []));
  }
};

const handleHookAndStateOnEvents = (
  path: NodePath<MemberExpression>,
  isHookDepArray?: boolean,
): boolean => {
  if (isIdentifier(path.node.property) && checkIsEvent(path.node.property.name)) {
    if (isIfStatement(path.parent)) {
      // We don't do anything if the event is in an IfStatement
      path.node.extra = { ...path.node.extra, updateExpression: true };
      return true;
    } else if (
      isCallExpression(path.parent) &&
      isIdentifier(path.node.object) &&
      isMemberExpression(path.parent.callee)
    ) {
      // We add "emit" to events
      const root = memberExpression(path.node, identifier('emit'));
      root.extra = { ...root.extra, updateExpression: true };
      path.replaceWith(root);
    } else if (isHookDepArray && isIdentifier(path.node.object)) {
      const iden = identifier(
        `// "${path.node.object.name}.${path.node.property.name}" is an event skip it.`,
      );

      path.replaceWith(iden);
      return true;
    }
  }
  return false;
};

const handleTemplateLiteral = (
  path: NodePath<TemplateLiteral>,
  json: MitosisComponent,
  context?: any,
) => {
  const fnName = `templateStr_${hashCodeAsString(path.toString())}`;
  const extraParams = new Set<string>();

  // Collect loop variables from context
  let currentContext = context;
  while (currentContext?.parent) {
    if (currentContext.parent.node?.name === ForNodeName) {
      const forNode = currentContext.parent.node;
      if (forNode.scope.forName) extraParams.add(forNode.scope.forName);
      if (forNode.scope.indexName) extraParams.add(forNode.scope.indexName);
    }
    currentContext = currentContext.parent;
  }

  const processedExpressions = path.node.expressions.map((expr) => {
    let exprCode = '';
    try {
      const { code } = require('@babel/generator').default(expr);
      exprCode = code;
    } catch (e) {
      exprCode = expr.toString();
    }

    // Replace state.x with this.x() for signals
    return exprCode
      .replace(/\bstate\.(\w+)(?!\()/g, 'this.$1()')
      .replace(/\bprops\.(\w+)(?!\()/g, 'this.$1()');
  });

  // Convert Set to Array for final usage
  const paramsList = Array.from(extraParams);

  json.state[fnName] = {
    code: `${fnName}(${paramsList.join(', ')}) { 
      return \`${path.node.quasis
        .map((quasi, i) => {
          const escapedRaw = quasi.value.raw.replace(/\\/g, '\\\\').replace(/\$/g, '\\$');
          return (
            escapedRaw +
            (i < processedExpressions.length ? '${' + processedExpressions[i] + '}' : '')
          );
        })
        .join('')}\`; 
    }`,
    type: 'method',
  };

  // Return the function call with any needed parameters
  return `${fnName}(${paramsList.join(', ')})`;
};

const handleCallExpressionArgument = (json: MitosisComponent | undefined, arg: any) => {
  if (
    isMemberExpression(arg) &&
    isIdentifier(arg.object) &&
    isIdentifier(arg.property) &&
    (arg.object.name === 'state' || arg.object.name === 'props') &&
    !arg.extra?.makeCallExpressionDone
  ) {
    if (arg.object.name === 'state' && json) {
      const argPath = { node: arg } as unknown as NodePath<MemberExpression>;
      if (isAFunctionOrMethod(json, argPath)) {
        const argStr = arg.object.name + '.' + arg.property.name;
        return identifier(`${argStr}.bind(this)`);
      }
    }

    const newArg = callExpression(arg, []);
    newArg.extra = { makeCallExpressionDone: true };
    return newArg;
  }
  return arg;
};

const transformHooksAndState = (
  code: string,
  isHookDepArray?: boolean,
  json?: MitosisComponent,
) => {
  return babelTransformExpression(code, {
    AssignmentExpression(path) {
      handleAssignmentExpression(path);
    },
    UpdateExpression(path) {
      /*
       * If we have a function like this:
       * `state._counter++;`
       *
       * We need to convert it and use the "update" example from https://angular.dev/guide/signals#writable-signals:
       * `state._counter.update(_counter=>_counter++)`
       *
       */
      if (
        isMemberExpression(path.node.argument) &&
        isIdentifier(path.node.argument.object) &&
        path.node.argument.object.name === 'state' &&
        isIdentifier(path.node.argument.property)
      ) {
        const root = memberExpression(path.node.argument, identifier('update'));
        root.extra = { ...root.extra, updateExpression: true };
        const argument = path.node.argument.property;
        const block = blockStatement([
          expressionStatement(updateExpression(path.node.operator, argument)),
          returnStatement(argument),
        ]);

        const arrowFunction = arrowFunctionExpression([argument], block);
        const call = callExpression(root, [arrowFunction]);
        path.replaceWith(call);
      } else if (
        isMemberExpression(path.node.argument) &&
        isMemberExpression(path.node.argument.object) &&
        isIdentifier(getBaseObject(path.node.argument)) &&
        getBaseObject(path.node.argument).name === 'state'
      ) {
        // Handle nested update expressions like: state.obj.counter++
        // Example:
        // Input:  state.obj.counter++
        // Output: state.obj.update(obj => {
        //   Object.assign(obj, {
        //     counter: obj.counter + 1
        //   });
        //   return obj;
        // });
        //
        const stateProp = getPropertyFromStateChain(path.node.argument);
        if (!stateProp) return;

        const topLevelProp = memberExpression(identifier('state'), identifier(stateProp));

        const nestedPaths = getNestedPath(path.node.argument, stateProp);

        const root = memberExpression(topLevelProp, identifier('update'));
        root.extra = { ...root.extra, updateExpression: true };

        const paramName = stateProp;
        const param = identifier(paramName);

        const lastPropName = nestedPaths[nestedPaths.length - 1];
        const innerParamName = lastPropName + '_value';

        const nestedPathAccess = buildPathAccess(param, nestedPaths.slice(0, -1));

        let innerValue = objectExpression([
          spreadElement(nestedPathAccess),
          objectProperty(
            identifier(lastPropName),
            updateExpression(path.node.operator, identifier(innerParamName), path.node.prefix),
            false,
            false,
          ),
        ]);

        for (let i = nestedPaths.length - 2; i >= 0; i--) {
          const spreadTarget = i === 0 ? param : buildPathAccess(param, nestedPaths.slice(0, i));

          innerValue = objectExpression([
            spreadElement(spreadTarget),
            objectProperty(identifier(nestedPaths[i]), innerValue, false, false),
          ]);
        }

        const block = blockStatement([
          expressionStatement(
            callExpression(memberExpression(identifier('Object'), identifier('assign')), [
              param,
              innerValue,
            ]),
          ),
          returnStatement(param),
        ]);

        const arrowFunction = arrowFunctionExpression([param], block);
        const call = callExpression(root, [arrowFunction]);
        path.replaceWith(call);
      }
    },
    MemberExpression(path) {
      const skip = handleHookAndStateOnEvents(path, isHookDepArray);
      if (skip) {
        return;
      }

      handleMemberExpression(path, json);
    },
    CallExpression(path) {
      // if args has a state.x or props.x, we need to add this.x() to the args
      if (path.node.arguments.length > 0) {
        const newArgs = path.node.arguments.map((arg) => handleCallExpressionArgument(json, arg));
        // Only replace arguments if we made any changes
        if (newArgs.some((arg, i) => arg !== path.node.arguments[i])) {
          path.node.arguments = newArgs;
        }
      }
    },
  });
};

const addToImportCall = (json: MitosisComponent, importName: string) => {
  const importInstance = json.imports.find((imp) => imp.imports[importName]);
  // Check if this is a type import - if it is, don't add it to importCalls
  if (importInstance?.importKind === 'type') {
    return;
  }

  const isImportCall = !!importInstance;
  const isExportCall = json.exports ? !!json.exports[importName] : false;
  if (isImportCall || isExportCall) {
    json.compileContext!.angular!.extra!.importCalls.push(importName);
  }
};

const transformBindings = (
  json: MitosisComponent,
  code: string,
  key?: string,
  context?: any,
): string => {
  return babelTransformExpression(code, {
    BlockStatement() {
      console.error(`
Component ${json.name} has a BlockStatement inside JSX'. 
This will cause an error in Angular.
Please create and call a new function instead with this code:
${code}`);
    },
    CallExpression(path) {
      // If we call a function from an import we need to add it to the Component as well
      if (isIdentifier(path.node.callee)) {
        addToImportCall(json, path.node.callee.name);
      }

      if (path.node.arguments.length > 0) {
        const newArgs = path.node.arguments.map((arg) => handleCallExpressionArgument(json, arg));
        // Only replace arguments if we made any changes
        if (newArgs.some((arg, i) => arg !== path.node.arguments[i])) {
          path.node.arguments = newArgs;
        }
      }
    },
    Identifier(path) {
      // If we use a constant from an import we need to add it to the Component as well
      if (isIdentifier(path.node)) {
        addToImportCall(json, path.node.name);
      }
    },
    StringLiteral(path) {
      // We cannot use " for string literal in template
      if (path.node.extra?.raw) {
        path.node.extra.raw = (path.node.extra.raw as string).replaceAll('"', '&quot;');
      }
    },
    AssignmentExpression(path) {
      handleAssignmentExpression(path);
    },
    MemberExpression(path) {
      handleMemberExpression(path, json);
    },
    TemplateLiteral(path) {
      // they are already created as trackBy functions
      if (key === 'key') {
        return;
      }
      // When we encounter a template literal, convert it to a function
      const fnCall = handleTemplateLiteral(path, json, context);
      path.replaceWith(identifier(fnCall));
    },
  });
};

export const getCodeProcessorPlugins = (
  json: MitosisComponent,
  options: ToAngularOptions,
  processBindingOptions: ProcessBindingOptions,
) => {
  return [
    ...(options.plugins || []),
    CODE_PROCESSOR_PLUGIN((codeType) => {
      switch (codeType) {
        case 'bindings':
          return (code, key, context) => {
            const needsToReplaceWithThis =
              (code.startsWith('{') && code.includes('...')) ||
              code.includes(' as ') ||
              context?.node.name.includes('.') ||
              context?.node.bindings[key]?.type === 'spread';

            let replaceWith = '';
            if (key === 'key') {
              /**
               * If we have a key attribute we need to check if it is inside a @for loop.
               * We will create a new function for the key attribute.
               * Therefore, we need to add "this" to state and props.
               */
              const isForParent = context?.parent?.parent?.node?.name === ForNodeName;
              if (isForParent) {
                replaceWith = 'this.';
              }
            }
            if (needsToReplaceWithThis) {
              replaceWith = 'this.';
            }

            return processClassComponentBinding(json, transformBindings(json, code, key, context), {
              ...processBindingOptions,
              replaceWith,
            });
          };
        case 'hooks-deps-array':
        case 'hooks':
        case 'state':
          return (code) => {
            return processClassComponentBinding(
              json,
              transformHooksAndState(code, codeType === 'hooks-deps-array', json),
              processBindingOptions,
            );
          };
        case 'properties':
        case 'hooks-deps':
        case 'context-set':
        case 'dynamic-jsx-elements':
        case 'types':
          return (code) => {
            return processClassComponentBinding(json, code, processBindingOptions);
          };
      }
    }),
  ];
};
