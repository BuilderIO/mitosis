module.exports = {
  env: {
    browser: true,
  },
  plugins: ["@jsx-lite"],
  parser: "@typescript-eslint/parser",
  extends: [],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "@jsx-lite/no-conditional-render": "warn",
  },
};
