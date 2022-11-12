import { flatten } from 'fp-ts/lib/Array';

export const INPUT_EXTENSIONS = {
  jsx: ['.lite.tsx', '.lite.jsx'],
  svelte: ['.svelte'],
};

export const INPUT_EXTENSIONS_ARRAY = flatten(Object.values(INPUT_EXTENSIONS));

/**
 * Matches `.svelte`, `.lite.tsx`, `.lite.jsx` files (with optional `.jsx`/`.tsx` extension)
 */
export const INPUT_EXTENSION_REGEX = /\.(svelte|(lite(\.tsx|\.jsx)?))['"]/g;
