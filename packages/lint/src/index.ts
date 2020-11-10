import type {
  RuleContext,
  RuleListener,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint/Rule';

console.log(0)

export const rules = {
  'jsx-lite/no-conditional-render': {
    meta: {
      messages: {
        no: 'No no no!',
      },
    },
    create: (
      context: Readonly<RuleContext<string, readonly unknown[]>>,
    ): RuleListener => {
      console.log(1)
      return {
        ConditionalExpression(node) {
          console.log(2)
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
