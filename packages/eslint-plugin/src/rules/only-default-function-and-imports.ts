import { Rule } from 'eslint';
import { types } from '@babel/core';
import isMitosisPath from '../helpers/isMitosisPath';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'only-default-function-and-imports',
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
      Program(node) {
        const { body } = node;

        for (const child of body) {
          if (
            !types.isImportDeclaration(child) &&
            !types.isExportDefaultDeclaration(child)
          ) {
            context.report({
              node: child as any,
              message:
                "Mitosis component file shouldn't contain anything other than import declamations and the component itself a default export",
            });
          }
        }
      },
    };
    return listener;
  },
};

export default rule;
