module.exports = {
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  plugins: ['@builder.io/mitosis'],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },

  rules: {
    // '@builder.io/mitosis/no-conditional-render': 'warn',
  },
};
