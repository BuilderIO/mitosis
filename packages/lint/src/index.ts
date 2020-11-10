import type { Rule } from 'eslint';

export const noConditionalRender = {
  create: (
    context: Readonly<Rule.RuleContext>,
  ): Rule.RuleListener => {
    return {
      ConditionalExpression(node) {
        context.report({
          node,
          message: 'No!',
        });
      },
    };
  },
}

export const rules = {
  'no-conditional-render': noConditionalRender,
};
