import { ToReactOptions } from '@/generators/react';
import { processHookCode } from '@/generators/react/helpers/state';
import { getOnEventHandlerName } from '@/helpers/on-event';
import { MitosisComponent } from '@/types/mitosis-component';

export const getOnInitHookComponentBody = ({
  shouldInlineOnInitHook,
  options,
  json,
}: {
  json: MitosisComponent;
  options: ToReactOptions;
  shouldInlineOnInitHook?: boolean;
}) =>
  json.hooks.onInit?.code
    ? shouldInlineOnInitHook
      ? processHookCode({ str: json.hooks.onInit.code, options })
      : `
        const hasInitialized = useRef(false);
        if (!hasInitialized.current) {
          ${processHookCode({
            str: json.hooks.onInit.code,
            options,
          })}
          hasInitialized.current = true;
        }
        `
    : '';

export const getOnEventHookComponentBody = (json: MitosisComponent) =>
  json.hooks.onEvent
    .map((hook) => {
      const eventName = `"${hook.eventName}"`;
      const handlerName = getOnEventHandlerName(hook);
      return `
      useEffect(() => {
        ${hook.refName}.current?.addEventListener(${eventName}, ${handlerName});
        return () => ${hook.refName}.current?.removeEventListener(${eventName}, ${handlerName});
      }, []);
      `;
    })
    .join('\n');

export const getOnMountComponentBody = ({
  options,
  json,
}: {
  json: MitosisComponent;
  options: ToReactOptions;
}) =>
  json.hooks.onMount
    .map(
      (hook) =>
        `useEffect(() => {
          ${processHookCode({
            str: hook.code,
            options,
          })}
        }, [])`,
    )
    .join('\n');

export const getOnUpdateComponentBody = ({
  options,
  json,
}: {
  json: MitosisComponent;
  options: ToReactOptions;
}) =>
  json.hooks.onUpdate
    ?.map(
      (hook) => `useEffect(() => {
          ${processHookCode({ str: hook.code, options })}
        },
        ${hook.deps ? processHookCode({ str: hook.deps, options }) : ''})`,
    )
    .join(';') ?? '';

export const getOnUnMountComponentBody = ({
  options,
  json,
}: {
  json: MitosisComponent;
  options: ToReactOptions;
}) =>
  json.hooks.onUnMount?.code
    ? `useEffect(() => {
          return () => {
            ${processHookCode({
              str: json.hooks.onUnMount.code,
              options,
            })}
          }
        }, [])`
    : '';
