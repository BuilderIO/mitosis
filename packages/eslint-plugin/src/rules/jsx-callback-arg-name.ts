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
      description: 'disallow naming the event arg for callbacks anything other than "event".',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {},
      // fill in your schema
    ],
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
      JSXExpressionContainer(node) {
        match(node)
          // Ignore zero length array's
          .with({ expression: { params: [] } }, noOp)
          // Ignore anything that doesn't have a function expression
          .with({ expression: not(when(types.isFunction)) }, noOp)
          // The actual match case
          .with(
            {
              parent: when(types.isJSXAttribute),
              expression: {
                // WARN: This is a list, not a 1-length tuple, this might not
                // work on cases that have multiple args - I don't know if there
                // is anything in the web api that expects multiple args for the
                // callback.
                params: [{ type: 'Identifier', name: not('event') }],
              },
            },
            ({
              expression: {
                params: [arg1],
              },
            }: any) => {
              context.report({
                node: arg1,
                message: 'Callback parameter must be called `event`',
                fix(fixer) {
                  return fixer.replaceText(arg1, 'event');
                },
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
