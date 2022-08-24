import { rules } from '../rules';

const PLUGIN_NAME = '@builder.io/mitosis' as const;

type RulesKeys = `${typeof PLUGIN_NAME}/${keyof typeof rules}`;

const recommendedRules: Record<RulesKeys, string> = {
  '@builder.io/mitosis/css-no-vars': 'error',
  '@builder.io/mitosis/jsx-callback-arg-name': 'error',
  '@builder.io/mitosis/jsx-callback-arrow-function': 'error',
  '@builder.io/mitosis/no-assign-props-to-state': 'error',
  '@builder.io/mitosis/no-async-methods-on-state': 'error',
  '@builder.io/mitosis/no-conditional-logic-in-component-render': 'error',
  '@builder.io/mitosis/no-state-destructuring': 'error',
  '@builder.io/mitosis/no-var-declaration-in-jsx': 'error',
  '@builder.io/mitosis/no-var-declaration-or-assignment-in-component': 'error',
  '@builder.io/mitosis/no-var-name-same-as-state-property': 'error',
  '@builder.io/mitosis/only-default-function-and-imports': 'error',
  '@builder.io/mitosis/ref-no-current': 'error',
  '@builder.io/mitosis/use-state-var-declarator': 'error',
  '@builder.io/mitosis/static-control-flow': 'error',
  '@builder.io/mitosis/no-var-name-same-as-prop-name': 'error',
};

export default {
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [PLUGIN_NAME],
  rules: recommendedRules,
};
