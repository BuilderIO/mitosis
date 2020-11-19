const {
  override,
  addBabelPresets,
  addWebpackPlugin,
} = require('customize-cra');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const os = require('os');

module.exports = function(config, env) {
  const conf = override(
    addBabelPresets('@emotion/babel-preset-css-prop'),
    addWebpackPlugin(new MonacoWebpackPlugin()),
  )(config, env);

  // For now turn minimize off as it's blowing out memory so builds never succeed
  conf.optimization.minimize = false;

  return conf;
};
