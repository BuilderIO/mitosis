const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // @babel/core imported by Mitosis imports `fs`. We don't need it in the browser, so we tell webpack to ignore it.
      // https://webpack.js.org/configuration/resolve/#resolvealias
      fs: false,
      module: false,
    };
    config.resolve.mainFields = ['browser', 'main', 'module'];

    config.resolve.plugins = [...config.resolve.plugins, new TsconfigPathsPlugin()];

    const falseAliases = {
      'globby': false,
      'coffeescript': false,
      'postcss-load-config': false,
      'CLIEngine': false,
      'svelte-preprocess': false,
      sass: false
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      ...falseAliases,
    }

    // config.optimization.minimizer = [];
    // config.optimization.minimize = false;

    return config;
  },
  experimental: {
    esmExternals: true,
    externalDir: true,
  },
  transpilePackages: [
    '@builder.io/mitosis'
  ]
};

module.exports = (nextConfig);
