import { isSlotProperty, replaceSlotsInString } from '../../helpers/slots';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';
import { MitosisComponent } from '../../types/mitosis-component';
import { ToSvelteOptions } from './types';

import { replaceIdentifiers } from '../../helpers/replace-identifiers';
import { getContextType } from '../helpers/context';

function getReactiveContextNames(json: MitosisComponent) {
  return Object.keys(json.context.get).filter((key) => {
    const newLocal = getContextType({
      context: json.context.get[key],
      component: json,
    });
    console.log(newLocal, json.context.get, json.meta.useMetadata?.context);
    return newLocal === 'reactive';
  });
}

export const makeContextGettersReactive =
  ({ json }: { json: MitosisComponent }) =>
  (code: string) => {
    return replaceIdentifiers({
      code,
      from: getReactiveContextNames(json),
      to: (name, identifier) => `$${identifier}.${name}`,
    });
  };

export const stripStateAndProps =
  ({ options, json }: { options: ToSvelteOptions; json: MitosisComponent }) =>
  (code: string) =>
    stripStateAndPropsRefs(code, {
      includeState: options.stateType === 'variables',
      replaceWith: (name) =>
        name === 'children'
          ? '$$slots.default'
          : isSlotProperty(name)
          ? replaceSlotsInString(name, (x) => `$$slots.${x}`)
          : name,
    });
