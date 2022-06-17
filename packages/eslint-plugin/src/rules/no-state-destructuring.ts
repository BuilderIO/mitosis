import * as types from '@babel/types';
import { Rule } from 'eslint';
import isMitosisPath from '../helpers/isMitosisPath';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow destructuring state',
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
      VariableDeclarator(node) {
        if (
          !types.isObjectPattern(node.id) ||
          !types.isIdentifier(node.init) ||
          node.init.name !== 'state'
        )
          return;

        context.report({
          node,
          message: "destructuring state isn't allowed: use standard assignment instead",
        });
      },
    };
    return listener;
  },
};

export default rule;
