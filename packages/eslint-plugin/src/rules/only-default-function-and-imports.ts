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
      description:
        'disallow anything other than import declarations, the component itself (in a default export), and type declarations inside the component file.',
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
            !types.isExportDefaultDeclaration(child) &&
            !types.isTypeAlias(child) &&
            !types.isInterfaceDeclaration(child)
          ) {
            context.report({
              node: child as any,
              message:
                'Mitosis component files should only contain import declarations, the component itself (in a default export), and type declarations',
            });
          }
        }
      },
    };
    return listener;
  },
};

export default rule;
