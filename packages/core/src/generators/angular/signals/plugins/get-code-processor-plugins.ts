import { ToAngularOptions } from '@/generators/angular/types';
import { babelTransformExpression } from '@/helpers/babel-transform';
import { ProcessBindingOptions, processClassComponentBinding } from '@/helpers/class-components';
import { checkIsEvent } from '@/helpers/event-handlers';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { MitosisComponent } from '@/types/mitosis-component';
import { NodePath, types } from '@babel/core';
import {
  AssignmentExpression,
  BinaryExpression,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
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
    const root = types.memberExpression(path.node.left, types.identifier('set'));
    root.extra = { ...root.extra, updateExpression: true };
    const call = types.callExpression(root, [path.node.right]);
    path.replaceWith(call);
  }
};

const transformHooksAndState = (code: string) => {
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
        const root = types.memberExpression(path.node.argument, types.identifier('update'));
        const argument = path.node.argument.property;
        const blockStatement = types.blockStatement([
          types.expressionStatement(types.updateExpression(path.node.operator, argument)),
          types.returnStatement(argument),
        ]);

        const arrowFunctionExpression = types.arrowFunctionExpression([argument], blockStatement);
        const call = types.callExpression(root, [arrowFunctionExpression]);
        path.replaceWith(call);
      }
    },
    MemberExpression(path) {
      if (path.node.extra?.makeCallExpressionDone || path.parentPath.node.extra?.updateExpression) {
        return;
      }

      // Event handling
      if (isIdentifier(path.node.property) && checkIsEvent(path.node.property.name)) {
        if (
          isCallExpression(path.parent) &&
          isIdentifier(path.node.object) &&
          isMemberExpression(path.parent.callee)
        ) {
          // We add "emit" to events
          const root = types.memberExpression(path.node, types.identifier('emit'));
          root.extra = { ...root.extra, updateExpression: true };
          path.replaceWith(root);
        }
        // We don't do anything if the event is in an e.g. IfStatement
        return;
      }

      if (isStateOrPropsExpression(path)) {
        path.node.extra = { ...path.node.extra, makeCallExpressionDone: true };
        path.replaceWith(types.callExpression(path.node, []));
      }
    },
  });
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
        const importName = path.node.callee.name;
        const isImportCall = json.imports.find((imp) => imp.imports[importName]);
        if (isImportCall) {
          json.compileContext!.angular!.extra!.importCalls.push(importName);
        }
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
      if (
        // Don't add a function if it is already one
        !(isCallExpression(path.parent) && isMemberExpression(path.parent.callee)) &&
        isStateOrPropsExpression(path) &&
        !path.node.extra?.makeCallExpressionDone &&
        !path.parent.extra?.updateExpression
      ) {
        path.node.extra = { ...path.node.extra, makeCallExpressionDone: true };
        path.replaceWith(types.callExpression(path.node, []));
      }
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
          return (code) => {
            return processClassComponentBinding(json, transformBindings(json, code), {
              ...processBindingOptions,
              replaceWith: '',
            });
          };
        case 'hooks-deps-array':
        case 'hooks':
        case 'state':
          return (code) => {
            return processClassComponentBinding(
              json,
              transformHooksAndState(code),
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
