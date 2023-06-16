import * as types from '@babel/types';
import { Rule } from 'eslint';
import isMitosisPath from '../helpers/isMitosisPath';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'no map function in jsx return body',
      recommended: true,
    },
  },

  create(context) {
    if (!isMitosisPath(context.getFilename())) return {};

    return {
      JSXExpressionContainer(node) {
        if (types.isJSXExpressionContainer(node)) {
          if (types.isCallExpression(node.expression)) {
            if (
              types.isMemberExpression(node.expression.callee) &&
              types.isIdentifier(node.expression.callee.property) &&
              node.expression.callee.property.name === 'map'
            ) {
              context.report({
                node: node as any,
                message:
                  'No map function in jsx return body. Please use <For /> component instead.',
              });
            }
          }
        }
      },
    };
  },
};

export default rule;
