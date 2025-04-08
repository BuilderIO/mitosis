import { ToAngularOptions } from '@/generators/angular/types';
import { babelTransformExpression } from '@/helpers/babel-transform';
import { ProcessBindingOptions, processClassComponentBinding } from '@/helpers/class-components';
import { checkIsEvent } from '@/helpers/event-handlers';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { MitosisComponent } from '@/types/mitosis-component';
import { ForNodeName } from '@/types/mitosis-node';
import { NodePath } from '@babel/core';
import {
  AssignmentExpression,
  BinaryExpression,
  MemberExpression,
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

const handleMemberExpression = (path: NodePath<MemberExpression>) => {
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

const transformHooksAndState = (code: string, isHookDepArray?: boolean) => {
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

      handleMemberExpression(path);
    },
  });
};

const addToImportCall = (json: MitosisComponent, importName: string) => {
  const isImportCall = json.imports.find((imp) => imp.imports[importName]);
  const isExportCall = json.exports ? !!json.exports[importName] : false;
  if (isImportCall || isExportCall) {
    json.compileContext!.angular!.extra!.importCalls.push(importName);
  }
};

const transformBindings = (json: MitosisComponent, code: string): string => {
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
      handleMemberExpression(path);
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
            const isASpreadExpr = code.includes('...');
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
            if (isASpreadExpr) {
              replaceWith = 'this.';
            }

            return processClassComponentBinding(json, transformBindings(json, code), {
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
              transformHooksAndState(code, codeType === 'hooks-deps-array'),
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
