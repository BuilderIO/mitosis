import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  tsconfig: './tsconfig.build.json',
  clean: true,
  format: ['esm', 'cjs'],
  dts: true,
  minify: !options.watch,
}));
