import { Rule } from 'eslint';
import * as types from '@babel/types';
import isMitosisPath from '../helpers/isMitosisPath';

export const staticControlFlow: Rule.RuleModule = {
  create(context) {
    if (!isMitosisPath(context.getFilename())) return {};

    return {
      VariableDeclarator(node) {
        if (types.isVariableDeclarator(node)) {
          if (
            types.isObjectPattern(node.id) &&
            types.isIdentifier(node.init) &&
            node.init.name === 'state'
          ) {
            context.report({
              node: node as any,
              message: 'Destructuring the state object is currently not supported',
            });
          }
        }
      },

      CallExpression(node) {
        if (types.isCallExpression(node)) {
          if (types.isIdentifier(node.callee) && node.callee.name === 'useEffect') {
            const useEffectMessage =
              'Only useEffect with an empty array second argument is allowed. E.g. useEffect(...) must be useEffect(..., [])';
            const secondArg = node.arguments[1];
            if (
              !(secondArg && types.isArrayExpression(secondArg) && secondArg.elements.length === 0)
            ) {
              context.report({
                node: node,
                message: useEffectMessage,
              });
            }
          }
        }
      },

      JSXExpressionContainer(node) {
        if (types.isJSXExpressionContainer(node)) {
          if (types.isConditionalExpression(node.expression)) {
            if (
              types.isJSXElement(node.expression.consequent) ||
              types.isJSXElement(node.expression.alternate)
            ) {
              context.report({
                node: node as any,
                message:
                  'Ternaries around JSX Elements are not currently supported. Instead use binary expressions - e.g. {foo ? <bar /> : <baz />} should be {foo && <bar />}{!foo && <baz />}',
              });
            }
          }
        }
      },
    };
  },
};
