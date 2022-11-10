import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

const dir = resolve(__dirname, 'node_modules', '@builder.io', 'e2e-app', 'output', 'alpine', 'alpine', 'src', 'components');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: dir,
    })
  ]
});
