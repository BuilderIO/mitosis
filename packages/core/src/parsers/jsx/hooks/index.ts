import * as babel from '@babel/core';
import generate from '@babel/generator';
import { HOOKS } from '../../../constants/hooks';
import { MitosisComponent } from '../../../types/mitosis-component';
import { parseCodeJson } from '../helpers';
import { parseStateObjectToMitosisState } from '../state';
import { ParseMitosisOptions } from '../types';
import { getHook } from './helpers';

const { types } = babel;

export function parseDefaultPropsHook(
  component: MitosisComponent,
  expression: babel.types.CallExpression,
) {
  const firstArg = expression.arguments[0];
  if (types.isObjectExpression(firstArg)) {
    component.defaultProps = parseStateObjectToMitosisState(firstArg, false);
  }
}

export function generateUseStyleCode(expression: babel.types.CallExpression) {
  return generate(expression.arguments[0]).code.replace(/(^("|'|`)|("|'|`)$)/g, '');
}

/**
 * Transform useMetadata({...}) onto the component JSON as
 * meta: { metadataHook: { ... }}
 *
 * This function collects metadata and removes the statement from
 * the returned nodes array
 */
export const collectModuleScopeHooks =
  (component: MitosisComponent, options: ParseMitosisOptions) => (nodes: babel.types.Statement[]) =>
    nodes.filter((node) => {
      const hook = getHook(node);
      if (!hook) {
        return true;
      }
      if (types.isIdentifier(hook.callee)) {
        const metadataHooks = new Set((options.jsonHookNames || []).concat(HOOKS.METADATA));
        if (metadataHooks.has(hook.callee.name)) {
          try {
            component.meta[hook.callee.name] = {
              ...((component.meta[hook.callee.name] as Object) || {}),
              ...parseCodeJson(hook.arguments[0]),
            };
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
