import { MitosisConfig, Target } from '@builder.io/mitosis';

/**
 * Output generated component file, before it is minified and transpiled into JS.
 */
export const checkShouldOutputTypeScript = ({
  target,
  options,
}: {
  target: Target;
  options: MitosisConfig;
}): boolean => {
  return !!options.options[target]?.typescript ? options.options[target].typescript : options.commonOptions?.typescript
};
