import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { MitosisComponent } from '@/types/mitosis-component';
import { getEventNameWithoutOn } from './event-handlers';

/**
 * We need to "emit" events those can be on multiple places, so we do it as post step
 */
const appendEmits = (str: string, events: string[]): string => {
  let code = str;
  if (events.length) {
    for (const event of events) {
      const eventWithoutOn = getEventNameWithoutOn(event);
      code = code
        .replaceAll(`props.${event}(`, `props.${eventWithoutOn}.emit(`)
        .replaceAll(`props.${event}`, `props.${eventWithoutOn}`);
    }
  }
  return code;
};

export type ProcessBindingOptions = { events: string[]; replaceWith?: string };

/**
 * We use this for generators like stencil and angular
 * @param json Your component
 * @param code The code to transform
 * @param events All event props as array
 * @param replaceWith In general you would use `this.` for classes
 */
export const processClassComponentBinding = (
  json: MitosisComponent,
  code: string,
  { events, replaceWith = 'this.' }: ProcessBindingOptions,
) => {
  let resolvedCode = stripStateAndPropsRefs(appendEmits(code, events), { replaceWith });
  if (json.exports) {
    // We need to use local exports with `this.` in stencil
    Object.entries(json.exports)
      .filter(([, value]) => value.usedInLocal)
      .forEach(([key]) => {
        resolvedCode = resolvedCode.replaceAll(key, `${replaceWith}${key}`);
      });
  }
  return resolvedCode;
};
