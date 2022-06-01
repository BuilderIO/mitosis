export default {
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@builder.io/mitosis'],
  rules: {
    '@builder.io/mitosis/css-no-vars': 'error',
    '@builder.io/mitosis/jsx-callback-arg-name': 'error',
    '@builder.io/mitosis/jsx-callback-arrow-function': 'error',
    '@builder.io/mitosis/no-assign-props-to-state': 'error',
    '@builder.io/mitosis/no-async-methods-on-state': 'error',
    '@builder.io/mitosis/no-conditional-logic-in-component-render': 'error',
    '@builder.io/mitosis/no-state-destructuring': 'error',
    '@builder.io/mitosis/no-var-declaration-in-jsx': 'error',
    '@builder.io/mitosis/no-var-declaration-or-assignment-in-component':
      'error',
    '@builder.io/mitosis/no-var-name-same-as-state-property': 'error',
    '@builder.io/mitosis/only-default-function-and-imports': 'error',
    '@builder.io/mitosis/ref-no-current': 'error',
    '@builder.io/mitosis/use-state-var-declarator': 'error',
  },
};
