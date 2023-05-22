import { Rule } from 'eslint';
import { match, not } from 'ts-pattern';
import { HOOKS } from '../constants/hooks';
import isMitosisPath from '../helpers/isMitosisPath';
import noOp from '../helpers/noOp';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow assigning useStore() to a variable with name other than state.',
      recommended: true,
    },
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
      CallExpression(node) {
        match(node)
          .with(
            {
              callee: {
                name: HOOKS.STORE,
              },
              parent: {
                type: 'VariableDeclarator',
                id: {
                  name: not('state'),
                },
              },
            },
            (node) => {
              context.report({
                node: node.parent.id as any,
                message: `${HOOKS.STORE} should be exclusively assigned to a variable called state`,
              });
            },
          )
          .otherwise(noOp);
      },
    };
    return listener;
  },
};

export default rule;
