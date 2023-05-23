import * as types from '@babel/types';
import { Rule } from 'eslint';
import isMitosisPath from '../helpers/isMitosisPath';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow variable declarations inside jsx.',
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
        const ans = context.getAncestors();
        if (ans.find(types.isJSXElement as any) && !ans.find(types.isJSXAttribute as any)) {
          context.report({
            node: node as any,
            message: 'Variable declaration inside jsx is ignored during compilation',
          });
        }
      },
    };
    return listener;
  },
};

export default rule;
