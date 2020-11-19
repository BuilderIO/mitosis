const {
  override,
  addBabelPresets,
  babelExclude,
  addWebpackPlugin,
} = require('customize-cra');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = function(config, env) {
  const conf = override(
    addBabelPresets('@emotion/babel-preset-css-prop'),
    addWebpackPlugin(new MonacoWebpackPlugin()),
    babelExclude(/parser-html/),
  )(config, env);

  // For now turn minimize off as it's blowing out memory so builds never succeed
  conf.optimization.minimize = false;

  return conf;
};
