/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // @babel/core imported by Mitosis imports `fs`. We don't need it in the browser, so we tell webpack to ignore it.
      // https://webpack.js.org/configuration/resolve/#resolvealias
      fs: false,
      module: false,
    };
    // config.resolve.mainFields = ['browser', 'main', 'module'];

    // config.resolve.plugins = [...config.resolve.plugins, new TsconfigPathsPlugin()];

    // config.resolve.alias['globby'] = false;

    config.module.rules.push({
      test: /svelte-preprocess.+d\.ts/,
      loader: 'ignore-loader',
    });

    config.module.rules.push({
      test: /postcss-load-config/,
      loader: 'ignore-loader',
    });

    config.module.rules.push({
      // resourceQuery: /raw/,
      test: [/@builder.io\/mitosis\/jsx-runtime/, /@builder.io\/mitosis\/dist\/src/],
      type: 'asset/source',
    })

    // config.module.rules.push({
    //   test: [/\/CLIEngine/, /\/globby/],
    //   issuer: /\/@typescript-eslint\//,
    //   use: 'null-loader',
    // });

    config.externals = {
      // This dep relies on a ton of problematic subdeps
      'svelte-preprocess': 'undefined',
      // This dep ships ESM ?? operator that webpack can't load
      'ts-morph': 'undefined',

      module
    };

    // config.optimization.minimizer = [];
    // config.optimization.minimize = false;

    return config;
  },
  experimental: {
    // esmExternals: true,
    externalDir: true,
  },
}

module.exports = nextConfig
