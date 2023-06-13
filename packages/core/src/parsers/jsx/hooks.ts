import * as babel from '@babel/core';
import { HOOKS } from '../../constants/hooks';
import { MitosisComponent } from '../../types/mitosis-component';
import { generateUseStyleCode, parseDefaultPropsHook } from './function-parser';
import { parseCodeJson } from './helpers';
import { getHook } from './helpers/hooks';
import { ParseMitosisOptions } from './types';

const { types } = babel;

/**
 * Transform useMetadata({...}) onto the component JSON as
 * meta: { metadataHook: { ... }}
 *
 * This function collects metadata and removes the statement from
 * the returned nodes array
 */
export const collectModuleScopeHooks = (
  nodes: babel.types.Statement[],
  component: MitosisComponent,
  options: ParseMitosisOptions,
) => {
  return nodes.filter((node) => {
    const hook = getHook(node);
    if (!hook) {
      return true;
    }
    if (types.isIdentifier(hook.callee)) {
      const metadataHooks = new Set((options.jsonHookNames || []).concat(HOOKS.METADATA));
      if (metadataHooks.has(hook.callee.name)) {
        try {
          if (component.meta[hook.callee.name]) {
            component.meta[hook.callee.name] = {
              ...(component.meta[hook.callee.name] as Object),
              ...parseCodeJson(hook.arguments[0]),
            };
          } else {
            component.meta[hook.callee.name] = parseCodeJson(hook.arguments[0]);
          }
          return false;
        } catch (e) {
          console.error(`Error parsing metadata hook ${hook.callee.name}`);
          throw e;
        }
      } else if (hook.callee.name === HOOKS.STYLE) {
        component.style = generateUseStyleCode(hook);
        return false;
      } else if (hook.callee.name === HOOKS.DEFAULT_PROPS) {
        parseDefaultPropsHook(component, hook);
      }
    }

    return true;
  });
};
