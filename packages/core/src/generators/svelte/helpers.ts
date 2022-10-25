import { MitosisComponent } from '../../types/mitosis-component';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { ToSvelteOptions } from './types';
import { replaceIdentifiers } from '../../helpers/replace-identifiers';

function getContextNames(json: MitosisComponent) {
  return Object.keys(json.context.get);
}

export const replaceContextGetters =
  ({ json }: { json: MitosisComponent }) =>
  (code: string) => {
    return replaceIdentifiers({
      code,
      from: getContextNames(json),
      to: (name) => `$${name}`,
    });
  };

export const stripStateAndProps =
  ({ options, json }: { options: ToSvelteOptions; json: MitosisComponent }) =>
  (code: string) =>
    stripStateAndPropsRefs(code, {
      includeState: options.stateType === 'variables',
      replaceWith: (name) => (name === 'children' ? '$$slots.default' : name),
    });
