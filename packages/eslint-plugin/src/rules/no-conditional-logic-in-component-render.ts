import { Rule } from 'eslint';
import { match } from 'ts-pattern';
import isMitosisPath from '../helpers/isMitosisPath';
import noOp from '../helpers/noOp';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow conditional logic in component render.',
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
      IfStatement(node) {
        match(node)
          .with(
            {
              type: 'IfStatement',
              parent: {
                type: 'BlockStatement',
                parent: {
                  type: 'FunctionDeclaration',
                  parent: {
                    type: 'ExportDefaultDeclaration',
                  },
                },
              },
            },
            (node) => {
              context.report({
                node: node as any,
                message: 'Conditional logic inside components is invalid',
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
