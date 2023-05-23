import * as types from '@babel/types';
import { AST, Rule } from 'eslint';
import isMitosisPath from '../helpers/isMitosisPath';

const regex = new RegExp('^on[A-Z]');

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow using regular functions as callbacks.',
      recommended: true,
    },
    fixable: 'code',
  },

  create(context) {
    // variables should be defined here
    const filename = context.getFilename();

    if (!isMitosisPath(filename)) return {};

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------
    //

    const listener: Rule.RuleListener = {
      JSXAttribute(node) {
        const {
          name: { name },
          value,
        } = node;

        if (typeof name !== 'string' || !regex.test(name)) return;
        if (types.isArrowFunctionExpression(value.expression)) return;

        context.report({
          node: value.expression as any,
          message: 'Callback value must be an arrow function expression',
          fix(fixer) {
            return fixer.replaceTextRange(node.value.expression.range as AST.Range, '(event)=>{}');
          },
        });
      },
    };
    return listener;
  },
};

export default rule;
