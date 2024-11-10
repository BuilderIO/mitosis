import { HOOKS } from '@/constants/hooks';
import { tryParseJson } from '@/helpers/json';
import { resolveMetadata } from '@/parsers/jsx/hooks/use-metadata';
import { MitosisComponent } from '@/types/mitosis-component';
import * as babel from '@babel/core';
import { NodePath } from '@babel/core';
import generate from '@babel/generator';
import { parseCode } from '../helpers';
import { parseStateObjectToMitosisState } from '../state';
import { Context, ParseMitosisOptions } from '../types';
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
  (context: Context, options: ParseMitosisOptions) => (path: NodePath<babel.types.Program>) => {
    const programNodes = path.node.body;
    return programNodes.filter((node) => {
      const hook = getHook(node);
      if (!hook) {
        return true;
      }
      if (types.isIdentifier(hook.callee)) {
        const metadataHooks = new Set((options.jsonHookNames || []).concat(HOOKS.METADATA));
        const name = hook.callee.name;
        if (metadataHooks.has(name)) {
          const metaDataObjectNode = hook.arguments[0];

          const code = options.filePath
            ? resolveMetadata({ context, node: metaDataObjectNode, nodePath: path, options })
            : parseCode(metaDataObjectNode);
          let json;
          try {
            json = tryParseJson(code ?? '');
          } catch (e) {
            // Meta data isn't simple json convert it to ast
            console.error(`Error parsing metadata hook ${name}`);
            throw e;
          }

          context.builder.component.meta[name] = {
            ...((context.builder.component.meta[name] as Object) || {}),
            ...json,
          };
          return false;
        } else if (name === HOOKS.STYLE) {
          context.builder.component.style = generateUseStyleCode(hook);
          return false;
        } else if (name === HOOKS.DEFAULT_PROPS) {
          parseDefaultPropsHook(context.builder.component, hook);
        }
      }

      return true;
    });
  };
