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
  returnStatement,
  updateExpression,
} from '@babel/types';

const isStateOrPropsExpression = (path: NodePath) => {
  return (
    isMemberExpression(path.node) &&
    isIdentifier(path.node.object) &&
    isIdentifier(path.node.property) &&
    (path.node.object.name === 'props' || path.node.object.name === 'state')
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
    // Check if the property is a method or function type, and if so, don't convert it to a callable
    if (
      isIdentifier(path.node.object) &&
      isIdentifier(path.node.property) &&
      path.node.object.name === 'state' &&
      json?.state &&
      typeof path.node.property.name === 'string' &&
      json.state[path.node.property.name] &&
      json.state[path.node.property.name]?.type &&
      (json.state[path.node.property.name]?.type === 'method' ||
        json.state[path.node.property.name]?.type === 'function')
    ) {
      // It's a function/method reference, don't convert it to a callable
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
  key?: string,
  context?: any,
) => {
  const fnName = `templateStr_${hashCodeAsString(path.toString())}`;

  const extraParams: string[] = [];

  let currentContext = context;
  while (currentContext?.parent) {
    if (currentContext.parent.node?.name === ForNodeName) {
      const forNode = currentContext.parent.node;
      if (forNode.scope.forName && !extraParams.includes(forNode.scope.forName)) {
        extraParams.push(forNode.scope.forName);
      }
      if (forNode.scope.indexName && !extraParams.includes(forNode.scope.indexName)) {
        extraParams.push(forNode.scope.indexName);
      }
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

    if (
      (key && checkIsEvent(key)) ||
      exprCode.includes('.emit(') ||
      exprCode.includes('.addEventListener')
    ) {
      return exprCode;
    }

    if (exprCode.includes('`')) {
      return exprCode;
    }

    // Special handling for ternary operators to properly preserve string literals
    if (exprCode.includes('?') && exprCode.includes(':')) {
      extraParams.forEach((param) => {
        exprCode = exprCode.replace(new RegExp(`\\b${param}\\b`, 'g'), `__${param}__`);
      });

      exprCode = exprCode.replace(/\bstate\.(\w+)(?!\()/g, 'this.$1()');
      exprCode = exprCode.replace(/\bprops\.(\w+)(?!\()/g, 'this.$1()');

      extraParams.forEach((param) => {
        exprCode = exprCode.replace(new RegExp(`__${param}__`, 'g'), param);
      });

      return exprCode;
    }

    // Keep loop variables like 'index' as-is (don't prefix with this)
    // But we need to process the rest of the expression
    if (extraParams.some((param) => exprCode.includes(param))) {
      extraParams.forEach((param) => {
        exprCode = exprCode.replace(new RegExp(`\\b${param}\\b`, 'g'), `__${param}__`);
      });

      // Replace state.x with this.x() but preserve the loop variables
      exprCode = exprCode.replace(/\bstate\.(\w+)(?!\()/g, 'this.$1()');
      exprCode = exprCode.replace(/\bprops\.(\w+)(?!\()/g, 'this.$1()');

      extraParams.forEach((param) => {
        exprCode = exprCode.replace(new RegExp(`__${param}__`, 'g'), param);
      });

      return exprCode;
    }

    // Replace state.x with this.x() for signals
    exprCode = exprCode.replace(/\bstate\.(\w+)(?!\()/g, 'this.$1()');
    exprCode = exprCode.replace(/\bprops\.(\w+)(?!\()/g, 'this.$1()');

    return exprCode;
  });

  const templateContent = path.node.quasis.map((quasi) => quasi.value.raw).join('');

  // Add loop variables like 'index' to the function parameters if they're in the template content
  // or if they appear in any expression
  extraParams.forEach((param) => {
    if (!extraParams.includes(param)) {
      processedExpressions.forEach((expr) => {
        if (expr.includes(param)) {
          extraParams.push(param);
        }
      });
    }

    if (!extraParams.includes(param) && templateContent.includes(param)) {
      extraParams.push(param);
    }
  });

  json.state[fnName] = {
    code: `${fnName}(${extraParams.join(', ')}) { 
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
  return `${fnName}(${extraParams.join(', ')})`;
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
        // Create new array for the transformed arguments
        const newArgs = path.node.arguments.map((arg) => {
          if (
            isMemberExpression(arg) &&
            isIdentifier(arg.object) &&
            isIdentifier(arg.property) &&
            (arg.object.name === 'state' || arg.object.name === 'props') &&
            !arg.extra?.makeCallExpressionDone
          ) {
            // Check if the property is a method or function type
            const isFunctionOrMethod =
              arg.object.name === 'state' &&
              json?.state &&
              typeof arg.property.name === 'string' &&
              json.state[arg.property.name] &&
              json.state[arg.property.name]?.type &&
              (json.state[arg.property.name]?.type === 'method' ||
                json.state[arg.property.name]?.type === 'function');

            // If it's a function/method reference, don't add parentheses
            if (isFunctionOrMethod) {
              return arg;
            }

            // Otherwise create a call expression for normal state values
            const newArg = callExpression(arg, []);
            newArg.extra = { makeCallExpressionDone: true };
            return newArg;
          }
          return arg;
        });

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
        // Create new array for the transformed arguments
        const newArgs = path.node.arguments.map((arg) => {
          if (
            isMemberExpression(arg) &&
            isIdentifier(arg.object) &&
            isIdentifier(arg.property) &&
            (arg.object.name === 'state' || arg.object.name === 'props') &&
            !arg.extra?.makeCallExpressionDone
          ) {
            // Create a new call expression instead of modifying the original node
            const newArg = callExpression(arg, []);
            newArg.extra = { makeCallExpressionDone: true };
            return newArg;
          }
          return arg;
        });

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
        path.node.extra.raw = (path.node.extra.raw as string).replaceAll('"', "'");
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
      const fnCall = handleTemplateLiteral(path, json, key, context);
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
            const theyConvertToGetters =
              (code.startsWith('{') && code.includes('...')) || code.includes(' as ');
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
            if (theyConvertToGetters) {
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
