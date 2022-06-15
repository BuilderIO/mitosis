// const withTM = require('next-transpile-modules')(['@builder.io/mitosis']);

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped. Doesn't make much sense, but how it is
      fs: false, // the solution
    };

    return config;
  },
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
