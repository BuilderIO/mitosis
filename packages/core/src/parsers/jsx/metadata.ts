import * as babel from '@babel/core';
import { MitosisComponent } from '../../types/mitosis-component';
import { parseCodeJson } from './helpers';
import { ParseMitosisOptions } from './types';

const { types } = babel;

const getHook = (node: babel.Node) => {
  const item = node;
  if (types.isExpressionStatement(item)) {
    const expression = item.expression;
    if (types.isCallExpression(expression)) {
      if (types.isIdentifier(expression.callee)) {
        return expression;
      }
    }
  }
  return null;
};

export const METADATA_HOOK_NAME = 'useMetadata';

/**
 * Transform useMetadata({...}) onto the component JSON as
 * meta: { metadataHook: { ... }}
 *
 * This function collects metadata and removes the statement from
 * the returned nodes array
 */
export const collectMetadata = (
  nodes: babel.types.Statement[],
  component: MitosisComponent,
  options: ParseMitosisOptions,
) => {
  const hookNames = new Set((options.jsonHookNames || []).concat(METADATA_HOOK_NAME));
  return nodes.filter((node) => {
    const hook = getHook(node);
    if (!hook) {
      return true;
    }
    if (types.isIdentifier(hook.callee) && hookNames.has(hook.callee.name)) {
      try {
        component.meta[hook.callee.name] = parseCodeJson(hook.arguments[0]);
        return false;
      } catch (e) {
        console.error(`Error parsing metadata hook ${hook.callee.name}`);
        throw e;
      }
    }
    return true;
  });
};
