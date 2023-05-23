import { MitosisConfig, Target } from '@builder.io/mitosis';
import * as esbuild from 'esbuild';
import { getFileExtensionForTarget } from './extensions';
import { checkIsMitosisComponentFilePath, INPUT_EXTENSION_IMPORT_REGEX } from './inputs-extensions';
import { checkShouldOutputTypeScript } from './options';

/**
 * Remove `.lite` or `.svelte` extensions from imports without having to load a slow parser like babel
 * E.g.
 *
 * convert `import { foo } from './block.lite';` -> `import { foo } from './block';`
 *
 * convert `import { foo } from './block.svelte';` -> `import { foo } from './block';`
 */
export const transformImports =
  ({ target, options }: { target: Target; options: MitosisConfig }) =>
  (code: string) =>
    code
      .replace(
        // we start by replacing all `context.lite` imports with `context`
        // This Context replace is only needed for non-mitosis components, i.e. plain `.js`/`.ts` files.
        // Mitosis components have logic that transform context import paths correctly.
        /\.context\.lite['"]/g,
        `.context.js$1`,
      )
      // afterwards, we replace all component imports with the correct file extension
      .replace(
        INPUT_EXTENSION_IMPORT_REGEX,
        `${getFileExtensionForTarget({ type: 'import', target, options })}$4`,
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
  content: string;
  target: Target;
  options: MitosisConfig;
}): Promise<string> => {
  try {
    const transpilerOptions = options.options[target]?.transpiler;
    const format = transpilerOptions?.format || 'esm';

    const output = await esbuild.transform(content, {
      format: format,
      /**
       * Collisions occur between TSX and TS Generic syntax. We want to only provide this loader config if the file is
       * a mitosis `.lite.tsx` file.
       */
      loader: checkIsMitosisComponentFilePath(path) ? 'tsx' : 'ts',
      target: 'es6',
    });

    if (output.warnings.length) {
      console.warn(`Warnings found in file: ${path}`, output.warnings);
    }

    return output.code;
  } catch (e) {
    console.error(`Error found in file: ${path}`);
    throw e;
  }
};

export const transpileIfNecessary = async ({
  content,
  options,
  path,
  target,
}: {
  path: string;
  content: string;
  target: Target;
  options: MitosisConfig;
}): Promise<string> =>
  checkShouldOutputTypeScript({ target, options })
    ? content
    : await transpile({ path, target, options, content });
