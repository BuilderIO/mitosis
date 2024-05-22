/**
 * This is the base config for vite.
 * When building, the adapter config is used which loads this file and extends it.
 */
import { partytownVite } from '@builder.io/partytown/utils';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikInsights } from '@builder.io/qwik-labs-canary/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { join } from 'path';
import { defineConfig, type UserConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { replaceCodePlugin } from 'vite-plugin-replace';
import tsconfigPaths from 'vite-tsconfig-paths';
import pkg from './package.json';
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  [key: string]: unknown;
};
/**
 * Note that Vite normally starts from `index.html` but the qwikCity plugin makes start at `src/entry.ssr.tsx` instead.
 */
export default defineConfig(({ command, mode }): UserConfig => {
  return {
    define: {
      'process.env': {},
    },
    plugins: [
      qwikCity(),
      qwikVite(),
      tsconfigPaths({ root: './' }),
      nodePolyfills(),
      qwikInsights({
        publicApiKey: '22gsbhtjcyv',
      }),
      replaceCodePlugin({
        replacements: [
          {
            from: 'process.cwd()',
            to: '"/"',
          },
        ],
      }),
      partytownVite({ dest: join(__dirname, 'dist', '~partytown') }),
    ],
    // This tells Vite which dependencies to pre-build in dev mode.
    optimizeDeps: {
      // Put problematic deps that break bundling here, mostly those with binaries.
      // For example ['better-sqlite3'] if you use that in server functions.
      exclude: ['@builder.io/mitosis'],
    },
    // This tells Vite how to bundle the server code.
    ssr:
      command === 'build' && mode === 'production'
        ? {
            // All dev dependencies should be bundled in the server build
            noExternal: Object.keys(devDependencies),
            // Anything marked as a dependency will not be bundled
            // These should only be production binary deps (including deps of deps), CLI deps, and their module graph
            // If a dep-of-dep needs to be external, add it here
            // For example, if something uses `bcrypt` but you don't have it as a dep, you can write
            // external: [...Object.keys(dependencies), 'bcrypt']
            external: Object.keys(dependencies),
          }
        : {
            external: ['@builder.io/mitosis'],
          },
    server: {
      headers: {
        // Don't cache the server response in dev mode
        'Cache-Control': 'public, max-age=0',
      },
    },
    preview: {
      headers: {
        // Do cache the server response in preview (non-adapter production build)
        'Cache-Control': 'public, max-age=600',
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
