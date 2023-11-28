import vue from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';

const config = defineConfig({
  plugins: [vue()],
  server: {
    host: 'localhost',
    strictPort: true,
  },
});

export default config;
