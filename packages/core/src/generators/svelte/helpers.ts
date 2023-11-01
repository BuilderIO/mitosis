import { isSlotProperty, replaceSlotsInString } from '@/helpers/slots';
import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { MitosisComponent } from '@/types/mitosis-component';
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
