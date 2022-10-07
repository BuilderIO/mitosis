import { BaseTranspilerOptions } from '..';

/**
 * Merges options while combining the `plugins` array.
 */
export const mergeOptions = <T extends BaseTranspilerOptions>(
  a: T,
  b: Partial<T> = {},
): T & { plugins: NonNullable<T['plugins']> } => {
  return {
    ...a,
    ...b,
    plugins: [...(a.plugins || []), ...(b.plugins || [])],
  };
};
