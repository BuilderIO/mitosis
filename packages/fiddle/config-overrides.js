const {
  override,
  addBabelPresets,
  addWebpackPlugin,
} = require('customize-cra');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = override(
  addBabelPresets('@emotion/babel-preset-css-prop'),
  addWebpackPlugin(new MonacoWebpackPlugin()),
);
