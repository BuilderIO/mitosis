import * as babel from '@babel/core';

const tsPreset = require('@babel/preset-typescript');

export type TranspileSolidFileOptions = {
  path: string;
  contents: string;
};

// TO-DO: can this be replaced with esbuild `transpile` helper
export async function transpileSolidFile(options: TranspileSolidFileOptions) {
  try {
    const output = babel
      .transform(options.contents, {
        filename: 'file.tsx',
        presets: [tsPreset],
      })
      .code // Remove .lite extensions from imports without having to load a slow parser like babel
      // E.g. convert `import { foo } from './block.lite';` -> `import { foo } from './block';`
      .replace(/\.lite(['"];)/g, '$1');

    return output;
  } catch (error) {
    console.log('failed to transpile solid file', options.contents);
    throw error;
  }
}
