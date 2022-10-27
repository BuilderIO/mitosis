import { MitosisComponent } from '../../types/mitosis-component';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { ToSvelteOptions } from './types';

import { replaceIdentifiers } from '../../helpers/replace-identifiers';
import { getContextType } from '../helpers/context';

function getReactiveContextNames(json: MitosisComponent) {
  return Object.keys(json.context.get).filter((key) => {
    return (
      getContextType({
        context: json.context.get[key],
        key,
        component: json,
      }) === 'reactive'
    );
  });
}

export const makeContextGettersReactive =
  ({ json }: { json: MitosisComponent }) =>
  (code: string) => {
    return replaceIdentifiers({
      code,
      from: getReactiveContextNames(json),
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
