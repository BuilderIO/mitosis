const withTM = require('next-transpile-modules')(['@builder.io/mitosis']);
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
    };

    config.resolve.plugins = [...config.resolve.plugins, new TsconfigPathsPlugin()];

    return config;
  },
  experimental: {
    esmExternals: true,
    externalDir: true,
  },
};

module.exports = withTM(nextConfig);
