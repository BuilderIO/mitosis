module.exports = {
  env: {
    browser: true,
  },
  plugins: ['@builder.io/mitosis'],
  extends: [
    // Use this approach for our recommended rules configuration
    'plugin:@builder.io/mitosis/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
