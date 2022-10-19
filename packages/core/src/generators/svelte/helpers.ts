import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { ToSvelteOptions } from './types';

export const stripStateAndProps = (code: string | undefined, options: ToSvelteOptions) =>
  stripStateAndPropsRefs(code, {
    includeState: options.stateType === 'variables',
    replaceWith: (name) => (name === 'children' ? '$$slots.default' : name),
  });
