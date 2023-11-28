import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: 'localhost',
    strictPort: true,
  },
  resolve: {
    // Vue 3 monorepo workaround:
    // https://github.com/vitejs/vite/issues/2446
    dedupe: ['vue'],
  },
});
