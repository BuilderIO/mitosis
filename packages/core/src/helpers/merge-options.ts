import { BaseTranspilerOptions, Target } from '..';
import { getSignalAccessPlugin, getSignalTypePlugin } from './plugins/process-signals';
import { processTargetBlocks } from './plugins/process-target-blocks';

/**
 * Merges options while combining the `plugins` array, and adds any default plugins.
 */
export const mergeOptions = <T extends BaseTranspilerOptions>(
  a: T,
  b: Partial<T> = {},
  c?: Partial<T>,
): T & { plugins: NonNullable<T['plugins']> } => {
  return {
    ...a,
    ...b,
    ...c,
    plugins: [...(a.plugins || []), ...(b.plugins || []), ...(c?.plugins || [])],
  };
};

/**
 * Merges options while combining the `plugins` array, and adds any default plugins.
 */
export const initializeOptions = <T extends BaseTranspilerOptions>(
  target: Target,
  a: T,
  b: Partial<T> = {},
  c?: Partial<T>,
): T & { plugins: NonNullable<T['plugins']> } => {
  const options = mergeOptions(a, b, c);

  // we want this plugin to run first in every case, as it replaces magic strings with the correct code.
  options.plugins.unshift(
    processTargetBlocks(target),
    getSignalTypePlugin({ target }),
    getSignalAccessPlugin({ target }),
  );

  return options;
};
