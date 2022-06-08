# Mitosis ESLint plugin

A Mitosis plugin containing rules that help you write valid and idiomatic Mitosis code

## Rules

- [css-no-vars](./docs/rules/css-no-vars.md)
- [jsx-callback-arg-name](./docs/rules/jsx-callback-arg-name.md)
- [jsx-callback-arrow-function](./docs/rules/jsx-callback-arrow-function.md)
- [no-assign-props-to-state](./docs/rules/no-assign-props-to-state.md)
- [no-async-methods-on-state](./docs/rules/no-async-methods-on-state.md)
- [no-conditional-logic-in-component-render](./docs/rules/no-conditional-logic-in-component-render.md)
- [no-state-destructuring](./docs/rules/no-state-destructuring.md)
- [no-var-declaration-in-jsx](./docs/rules/no-var-declaration-in-jsx.md)
- [no-var-declaration-or-assignment-in-component](./docs/rules/no-var-declaration-or-assignment-in-component.md)
- [no-var-name-same-as-state-property](./docs/rules/no-var-name-same-as-state-property.md)
- [only-default-function-and-imports](./docs/rules/only-default-function-and-imports.md)
- [ref-no-current](./docs/rules/ref-no-current.md)
- [use-state-var-declarator](./docs/rules/use-state-var-declarator.md)

## Setup

First, make sure you have [ESLint setup correctly](https://eslint.org/docs/user-guide/getting-started#installation-and-usage). Then, install this plugin by running:

```bash
yarn add -D @builder.io/eslint-plugin-mitosis@dev
```

Finally, add the plugin to the `plugins` array, and the rules you want to the `rules` array:

```js
module.exports = {
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@builder.io/mitosis'],
  extends: [
    // Use this approach for our recommended rules configuration
    'plugin:@builder.io/mitosis/recommended',
  ],
  rules: {
    // Use this to configure rules individually
    '@builder.io/mitosis/css-no-vars': 'error',
  },
};
```
