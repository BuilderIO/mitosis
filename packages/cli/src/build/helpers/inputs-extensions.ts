import { flatten } from 'fp-ts/lib/Array';

export const INPUT_EXTENSIONS = {
  jsx: ['.lite.tsx', '.lite.jsx'],
  svelte: ['.svelte'],
};

export const INPUT_EXTENSIONS_ARRAY = flatten(Object.values(INPUT_EXTENSIONS));

// check if filePath ends with one of the values of INPUT_EXTENSIONS_ARRAY
export const checkIsMitosisComponentFilePath = (filePath: string) => {
  return INPUT_EXTENSIONS_ARRAY.some((extension) => filePath.endsWith(extension));
};

/**
 * Matches `.svelte`, `.lite.tsx`, `.lite.jsx` files (with optional `.jsx`/`.tsx` extension)
 */
export const INPUT_EXTENSION_REGEX = /\.(svelte|(lite(\.tsx|\.jsx)?))/g;

// Adds trailing quotes to the end of import paths
export const INPUT_EXTENSION_IMPORT_REGEX = /\.(svelte|(lite(\.tsx|\.jsx)?))['"]/g;
