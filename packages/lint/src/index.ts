import type {
  RuleContext,
  RuleListener,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint/Rule';

console.log(0)

export const rules = {
  'no-conditional-render': {
    meta: {
      messages: {
        no: 'No no no!',
      },
    },
    create: (
      context: Readonly<RuleContext<string, readonly unknown[]>>,
    ): RuleListener => {
      return {
        ConditionalExpression(node) {
          context.report({
            node,
            messageId: 'no',
          });
        },
        FunctionDeclaration(node) {
          context.report({
            node,
            messageId: 'no',
          });
        },
      };
    },
  },
};
