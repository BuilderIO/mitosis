import { ToAngularOptions } from '@/generators/angular/types';
import { babelTransformExpression } from '@/helpers/babel-transform';
import { ProcessBindingOptions, processClassComponentBinding } from '@/helpers/class-components';
import { CODE_PROCESSOR_PLUGIN } from '@/helpers/plugins/process-code';
import { MitosisComponent } from '@/types/mitosis-component';
import { Node, types } from '@babel/core';
import { isCallExpression, isIdentifier, isMemberExpression } from '@babel/types';

const isStateOrPropsExpression = (node: Node) => {
  return (
    isMemberExpression(node) &&
    isIdentifier(node.object) &&
    isIdentifier(node.property) &&
    (node.object.name === 'props' || node.object.name === 'state')
  );
};

const addCallExpressionExtra = (node: Node) => {
  if (isStateOrPropsExpression(node) && !node.extra?.makeCallExpressionDone) {
    node.extra = { makeCallExpression: true };
  }
};

const transformToSignals = (json: MitosisComponent, code: string) => {
  return babelTransformExpression(code, {
    AssignmentExpression(path) {
      if (
        isMemberExpression(path.node.left) &&
        isIdentifier(path.node.left.object) &&
        isIdentifier(path.node.left.property) &&
        path.node.left.object.name === 'state'
      ) {
        const root = types.memberExpression(path.node.left, types.identifier('set'));
        const call = types.callExpression(root, [path.node.right]);
        call.extra = { updateExpression: true };
        path.replaceWith(call);
      }
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
        call.extra = { updateExpression: true };
        path.replaceWith(call);
      }
    },
    CallExpression(path) {
      if (path.node.extra?.updateExpression) {
        return;
      }
      /*
       * If we have a function like this:
       * `buttonRef?.setAttribute('data-counter', state._counter.toString());`
       *
       * We need to convert it to a callExpression for signals:
       * `buttonRef?.setAttribute('data-counter', state._counter().toString());`
       *
       */
      if (isMemberExpression(path.node.callee)) {
        addCallExpressionExtra(path.node.callee.object);
      }
      /*
       * If we have a function like this:
       * `console.log(props.test)`
       *
       * We need to convert it to a callExpression for signals:
       * `console.log(props.test())`
       *
       */
      path.node.arguments.forEach((argument) => {
        addCallExpressionExtra(argument);
      });
    },
    MemberExpression(path) {
      if (
        path.node.extra &&
        path.node.extra.makeCallExpression &&
        !path.node.extra.makeCallExpressionDone
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
            code = babelTransformExpression(code, {
              MemberExpression(path) {
                if (
                  !isCallExpression(path.parent) && // Don't add a function if it is already one
                  isStateOrPropsExpression(path.node) &&
                  !path.node.extra?.makeCallExpressionDone
                ) {
                  path.node.extra = { ...path.node.extra, makeCallExpressionDone: true };
                  path.replaceWith(types.callExpression(path.node, []));
                }
              },
            });

            return processClassComponentBinding(json, code, {
              ...processBindingOptions,
              replaceWith: '',
            });
          };
        case 'hooks':
        case 'state':
          return (code) => {
            return processClassComponentBinding(
              json,
              transformToSignals(json, code),
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
