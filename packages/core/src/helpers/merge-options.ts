import { BaseTranspilerOptions } from '..';

/**
 * Merges options while combining the `plugins` array.
 */
export const mergeOptions = <T extends BaseTranspilerOptions>(a: T, b: T): T => {
  return {
    ...a,
    ...b,
    plugins: [...(a.plugins || []), ...(b.plugins || [])],
  };
};
