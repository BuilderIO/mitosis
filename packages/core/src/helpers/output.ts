import { MitosisConfig, Target } from '@builder.io/mitosis';
import { checkIsDefined } from './nullable';

export const checkShouldOutputTypeScript = ({
  target,
  options,
}: {
  target: Target;
  options: MitosisConfig;
}): boolean => {
  const targetTsConfig = options.options[target]?.typescript;
  return checkIsDefined(targetTsConfig) ? targetTsConfig : false;
};
