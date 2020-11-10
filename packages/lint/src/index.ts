import type { Rule } from 'eslint';

export const staticControlFlow = {
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
  'static-control-flow': staticControlFlow,
};
