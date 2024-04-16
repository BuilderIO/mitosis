import {
  checkIsLiteComponentFilePath,
  checkShouldOutputTypeScript,
  MitosisConfig,
  renameComponentImport,
  renameImport,
  Target,
} from '@builder.io/mitosis';
import * as esbuild from 'esbuild';

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
  (code: string) => {
    // we start by replacing all `context.lite` imports with `context`
    // This Context replace is only needed for non-mitosis components, i.e. plain `.js`/`.ts` files.
    // Mitosis components have logic that transform context import paths correctly.
    code = code.replace(/\.context\.lite(.js|.ts)?(['"])/g, `.context.js$2`);

    // afterwards, we replace all component imports with the correct file extension
    code = renameComponentImport({
      importPath: code,
      target: target,
      explicitImportFileExtension: options.options?.[target]?.explicitImportFileExtension || false,
    });

    // if we really need to update the file extensions as well from .js to something else we do it here
    code = renameImport({
      importPath: code,
      target: target,
      explicitImportFileExtension: options.options?.[target]?.explicitImportFileExtension || false,
    });
    return code;
  };

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
      loader: checkIsLiteComponentFilePath(path) ? 'tsx' : 'ts',
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
