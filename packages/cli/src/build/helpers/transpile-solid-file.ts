import * as babel from '@babel/core';
import { MitosisComponent } from '@builder.io/mitosis';
import dedent from 'dedent';
import * as json5 from 'json5';

const tsPreset = require('@babel/preset-typescript');

export type TranspileSolidFileOptions = {
  path: string;
  contents: string;
  mitosisComponent: MitosisComponent;
};

export async function transpileSolidFile(options: TranspileSolidFileOptions) {
  let str = babel
    .transform(options.contents, {
      filename: 'file.tsx',
      presets: [tsPreset],
    })
    .code // Remove .lite extensions from imports without having to load a slow parser like babel
    // E.g. convert `import { foo } from './block.lite';` -> `import { foo } from './block';`
    .replace(/\.lite(['"];)/g, '$1');

  return str;
}
