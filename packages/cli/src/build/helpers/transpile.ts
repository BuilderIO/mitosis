import * as esbuild from 'esbuild';
import { readFile } from 'fs-extra';
import { Format, MitosisConfig, Target } from '@builder.io/mitosis';
import { getFileExtensionForTarget } from './extensions';

const getDefaultFormatForTarget = (target: Target): Format => {
  switch (target) {
    case 'reactNative':
    case 'solid':
    case 'svelte':
      return 'esm';
    default:
      return 'cjs';
  }
};

export const transpile = async ({
  path,
  content,
  target,
  options,
}: {
  path: string;
  content?: string | null;
  target: Target;
  options: MitosisConfig;
}) => {
  try {
    const transpilerOptions = options.options[target]?.transpiler;
    const format =
      transpilerOptions?.format || getDefaultFormatForTarget(target);

    let useContent = content ?? (await readFile(path, 'utf8'));
    useContent = useContent.replace(/getTarget\(\)/g, `"${target}"`);
    const output = await esbuild.transform(useContent, {
      format: format,
      loader: 'tsx',
      target: 'es6',
    });

    if (output.warnings.length) {
      console.warn(`Warnings found in file: ${path}`, output.warnings);
    }

    let contents = output.code;

    if (target === 'reactNative') {
      // esbuild does not add the reactNative import, so we need to add it
      if (!contents.match(/from\s+['"]react['"]/)) {
        contents = `import * as React from 'react';\n${output.code}`;
      }
    }

    // Remove .lite extensions from imports without having to load a slow parser like babel
    // E.g. convert `import { foo } from './block.lite';` -> `import { foo } from './block';`
    contents = contents
      .replace(
        // we start by replacing all `context.lite` imports with `context`
        /\.context\.lite(['"][;\)])/g,
        `$1`,
      )
      .replace(
        // afterwards, we replace all `.lite` imports with the correct file extension
        /\.lite(['"][;\)])/g,
        `${getFileExtensionForTarget(target)}$1`,
      );
    return contents;
  } catch (e) {
    console.error(`Error found in file: ${path}`);
    throw e;
  }
};
