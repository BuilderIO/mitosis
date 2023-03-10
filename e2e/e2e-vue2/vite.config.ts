import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import Components from 'unplugin-vue-components/vite';

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

  plugins: [vue(), Components()],

  server: {
    port: 8080,
  },
});

export default config;
