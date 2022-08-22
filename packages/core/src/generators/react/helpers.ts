import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';

import { ToReactOptions } from './types';

export const processBinding = (str: string, options: ToReactOptions) => {
  if (options.stateType !== 'useState') {
    return str;
  }

  return stripStateAndPropsRefs(str, {
    includeState: true,
    includeProps: false,
  });
};
