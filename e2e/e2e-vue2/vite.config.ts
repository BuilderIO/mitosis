import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

const config = defineConfig({
  plugins: [vue()],
  server: {
    host: 'localhost',
    strictPort: true,
  },
});

export default config;
