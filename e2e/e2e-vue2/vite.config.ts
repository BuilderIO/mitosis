import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import ViteComponents from 'vite-plugin-components';
import { resolve } from 'path';

const config = defineConfig({
  resolve: {
    alias: {
      '@': `${resolve(__dirname, 'src')}`,
    },
  },

  build: {
    minify: true,
  },

  plugins: [createVuePlugin({}), ViteComponents({ transformer: 'vue2' })],

  server: {
    port: 8080,
  },
});

export default config;
