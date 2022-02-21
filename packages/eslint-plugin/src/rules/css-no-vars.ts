import { types } from '@babel/core';
import { Rule, AST } from 'eslint';
import { match, not, when } from 'ts-pattern';
import isMitosisPath from '../helpers/isMitosisPath';
import noOp from '../helpers/noOp';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'css-no-vars',
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
      JSXAttribute(node) {
        match(node)
          .with(
            {
              name: {
                name: 'css',
                value: {
                  expression: {
                    type: 'ObjectExpression',

                    properties: [],
                  },
                },
              },
            },
            noOp,
          )
          .with(
            {
              name: {
                name: 'css',
              },
              value: {
                expression: {
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'Property',
                      value: when(types.isIdentifier),
                    },
                  ],
                },
              },
            },
            ({ value: { expression } }) => {
              context.report({
                node: expression as any,
                message: "Css properties can't be a variable",
              });
            },
          )
          .with(
            {
              name: {
                name: 'css',
              },
              value: {
                expression: {
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'Property',
                      // workaround TS2615 error
                      value: not(not(when(types.isConditionalExpression))),
                    },
                  ],
                },
              },
            },
            ({ value: { expression } }) => {
              context.report({
                node: expression as any,
                message: "Css properties can't be a ternary expression",
              });
            },
          )
          .with(
            {
              name: {
                name: 'css',
              },
              value: {
                expression: not(when(types.isObjectExpression)),
              },
            },
            ({ value: { expression } }) => {
              context.report({
                node: expression as any,
                message: 'Css attribute value must be an object',
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
