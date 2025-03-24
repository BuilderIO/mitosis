import { stripStateAndPropsRefs } from '@/helpers/strip-state-and-props-refs';
import { throwError } from '@/helpers/throw-error';
import { Target } from '@/types/config';
import { MitosisComponent } from '@/types/mitosis-component';
import { getEventNameWithoutOn } from './event-handlers';

/**
 * We need to "emit" events those can be on multiple places, so we do it as post step
 */
const appendEmits = (
  str: string,
  { name }: MitosisComponent,
  { events, props, target }: ProcessBindingOptions,
): string => {
  let code = str;
  if (events.length) {
    for (const event of events) {
      const eventWithoutOn = getEventNameWithoutOn(event);

      if (props.includes(eventWithoutOn)) {
        throwError(`Component ${name} has an event ${event} that conflicts with prop ${eventWithoutOn} for target ${target}.
        Please rename the prop or the event.`);
      }

      code = code
        .replaceAll(`props.${event}(`, `props.${eventWithoutOn}.emit(`)
        .replaceAll(`props.${event}`, `props.${eventWithoutOn}`);
    }
  }
  return code;
};

export type ProcessBindingOptions = {
  events: string[];
  props: string[];
  target: Target;
  replaceWith?: string;
};

/**
 * We use this for generators like stencil and angular
 */
export const processClassComponentBinding = (
  json: MitosisComponent,
  code: string,
  processBindingOptions: ProcessBindingOptions,
) => {
  const { replaceWith = 'this.' } = processBindingOptions;
  let resolvedCode = stripStateAndPropsRefs(appendEmits(code, json, processBindingOptions), {
    replaceWith,
  });
  if (json.exports) {
    // We need to use local exports with `this.` in stencil
    Object.entries(json.exports)
      .filter(([, value]) => value.usedInLocal)
      .forEach(([key]) => {
        resolvedCode = resolvedCode.replaceAll(key, `${replaceWith}${key}`);
      });
  }
  if (json.context.get) {
    for (const key of Object.keys(json.context.get)) {
      resolvedCode = resolvedCode.replaceAll(key, `${replaceWith}${key}`);
    }
  }

  return resolvedCode;
};
