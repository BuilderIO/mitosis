import { Rule } from 'eslint';
import { types } from '@babel/core';
import { isJSXLitePath } from './rules/jsx-callback-arg-name';

export const staticControlFlow: Rule.RuleModule = {
  create(context) {
    if (!isJSXLitePath(context.getFilename())) return {};

    return {
      VariableDeclarator(node: any) {
        if (types.isVariableDeclarator(node)) {
          if (
            types.isObjectPattern(node.id) &&
            types.isIdentifier(node.init) &&
            node.init.name === 'state'
          ) {
            context.report({
              node: node as any,
              message:
                'Destructuring the state object is currently not supported',
            });
          }
        }
      },

      JSXExpressionContainer(node: any) {
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

export const rules = {
  'static-control-flow': staticControlFlow,
  'jsx-callback-arg-name': import('./rules/jsx-callback-arg-name'),
};
