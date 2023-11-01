import { isSlotProperty, replaceSlotsInString } from 'src/helpers/slots';
import { stripStateAndPropsRefs } from 'src/helpers/strip-state-and-props-refs';
import { MitosisComponent } from 'src/types/mitosis-component';
import { ToSvelteOptions } from './types';

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
