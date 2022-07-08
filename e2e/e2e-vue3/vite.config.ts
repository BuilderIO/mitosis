import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // Vue 3 monorepo workaround:
    // https://github.com/vitejs/vite/issues/2446
    dedupe: ['vue'],
  },
});
