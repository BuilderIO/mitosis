import { BaseTranspilerOptions, MitosisComponent, Target } from '..';
import { getSignalAccessPlugin, getSignalTypePlugin } from './plugins/process-signals';
import { processTargetBlocks } from './plugins/process-target-blocks';

/**
 * Merges options while combining the `plugins` array, and adds any default plugins.
 */
export const mergeOptions = <T extends BaseTranspilerOptions>(
  a: T,
  b: Partial<T> = {},
  c?: Partial<T>,
  d?: Partial<T>,
): T & { plugins: NonNullable<T['plugins']> } => {
  return {
    ...a,
    ...b,
    ...c,
    ...d,
    plugins: [
      ...(a.plugins || []),
      ...(b.plugins || []),
      ...(c?.plugins || []),
      ...(d?.plugins || []),
    ],
  };
};

/**
 * Merges options while combining the `plugins` array, and adds any default plugins.
 */
export const initializeOptions = <T extends BaseTranspilerOptions>({
  target,
  component,
  defaults,
  userOptions,
  extra,
}: {
  target: Target;
  component: MitosisComponent;
  defaults: T;
  userOptions?: Partial<T>;
  extra?: Partial<T>;
}): T & { plugins: NonNullable<T['plugins']> } => {
  const metadataOverrides = component.meta?.useMetadata?.options?.[target] as
    | Partial<T>
    | undefined;

  const options = mergeOptions(defaults, userOptions, extra, metadataOverrides);

  // we want this plugin to run first in every case, as it replaces magic strings with the correct code.
  options.plugins.unshift(
    processTargetBlocks(target),
    getSignalTypePlugin({ target }),
    getSignalAccessPlugin({ target }),
  );

  return options;
};
