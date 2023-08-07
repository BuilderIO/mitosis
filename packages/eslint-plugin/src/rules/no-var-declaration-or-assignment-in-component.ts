import { Rule } from 'eslint';
import { match, not, when } from 'ts-pattern';
import { HOOKS } from '../constants/hooks';
import isMitosisPath from '../helpers/isMitosisPath';
import noOp from '../helpers/noOp';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow variable declaration inside component file.',
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
      VariableDeclaration(node) {
        match(node)
          .with(
            {
              declarations: [
                not({
                  init: {
                    type: 'CallExpression',
                    callee: {
                      type: 'Identifier',
                      name: when(
                        (v) =>
                          v === HOOKS.STATE ||
                          v === HOOKS.CONTEXT ||
                          v === HOOKS.STORE ||
                          v === HOOKS.REF,
                      ),
                    },
                  },
                }),
              ],
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
                message: 'Variable declaration inside component is ignored during compilation',
              });
            },
          )
          .otherwise(noOp);
      },
      AssignmentExpression(node) {
        match(node)
          .with(
            {
              parent: {
                type: 'ExpressionStatement',
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
            },
            (node) => {
              context.report({
                node: node as any,
                message: 'Variable assignment inside component is ignored during compilation',
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
