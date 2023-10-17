const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.mainFields = ['browser', 'main', 'module'];

    config.resolve.plugins = [...config.resolve.plugins, new TsconfigPathsPlugin()];

    /**
     * These node pkgs areimported by Mitosis, but we don't need them in the browser, so we tell webpack to ignore it.
     * https://webpack.js.org/configuration/resolve/#resolvealias
     */
    const falseAliases = {
      globby: false,
      coffeescript: false,
      'postcss-load-config': false,
      perf_hooks: false,
      fs: false,
      module: false,
      CLIEngine: false,
      'svelte-preprocess': false,
      sass: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      ...falseAliases,
    };

    // config.optimization.minimizer = [];
    // config.optimization.minimize = false;

    return config;
  },
  experimental: {
    esmExternals: true,
  },
  transpilePackages: ['@builder.io/mitosis'],
};

module.exports = nextConfig;
