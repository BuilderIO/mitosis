import * as types from '@babel/types';
import { Rule } from 'eslint';
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
      description: 'disallow variables as a value for the css attribute.',
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
                },
              },
            },
            ({ value: { expression } }) => {
              const { properties } = expression as any;
              for (const prop of properties) {
                if (prop.value && types.isIdentifier(prop.value)) {
                  context.report({
                    node: prop as any,
                    message: "Css properties can't be a variable",
                  });
                } else if (prop.value && types.isConditionalExpression(prop.value)) {
                  context.report({
                    node: prop as any,
                    message: "Css properties can't be a ternary expression",
                  });
                } else if (prop.value && types.isMemberExpression(prop.value)) {
                  context.report({
                    node: prop as any,
                    message: "Css properties can't be a member expression",
                  });
                }
              }
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
