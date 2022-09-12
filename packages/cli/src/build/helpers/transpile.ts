import * as esbuild from 'esbuild';
import { readFile } from 'fs-extra';
import { MitosisConfig, Target } from '@builder.io/mitosis';
import { getFileExtensionForTarget } from './extensions';

/**
 * Remove `.lite` extensions from imports without having to load a slow parser like babel
 * E.g. convert `import { foo } from './block.lite';` -> `import { foo } from './block';`
 */
export const transformImports = (target: Target, options: MitosisConfig) => (code: string) =>
  code
    .replace(
      // we start by replacing all `context.lite` imports with `context`
      // This Context replace is only needed for non-mitosis components, i.e. plain `.js`/`.ts` files.
      // Mitosis components have logic that transform context import paths correctly.
      /\.context\.lite(['"][;\)])/g,
      `.context.js$1`,
    )
    .replace(
      // afterwards, we replace all `.lite` imports with the correct file extension
      /\.lite(['"][;\)])/g,
      `${getFileExtensionForTarget({ type: 'import', target, options })}$1`,
    );

/**
 * Runs `esbuild` on a file, and performs some additional transformations.
 */
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
    const format = transpilerOptions?.format || 'esm';

    const useContent = content ?? (await readFile(path, 'utf8'));

    const output = await esbuild.transform(useContent, {
      format: format,
      /**
       * Collisions occur between TSX and TS Generic syntax. We want to only provide this loader config if the file is
       * a mitosis `.lite.tsx` file.
       */
      loader: path.endsWith('.tsx') ? 'tsx' : 'ts',
      target: 'es6',
    });

    if (output.warnings.length) {
      console.warn(`Warnings found in file: ${path}`, output.warnings);
    }

    const contents = transformImports(target, options)(output.code);

    return contents;
  } catch (e) {
    console.error(`Error found in file: ${path}`);
    throw e;
  }
};
