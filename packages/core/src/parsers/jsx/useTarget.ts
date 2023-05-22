import * as babel from '@babel/core';
import { HOOKS } from '../../constants/hooks';
import { ParseMitosisOptions } from './types';
import generate from '@babel/generator';

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
 * This function finds `useTarget()` and converts it our JSON representation
 */
export const collectModuleScopeHooks = (
  node: babel.types.Statement,
  options: ParseMitosisOptions,
) => {
  const hook = getHook(node);
  if (!hook) {
    return undefined;
  }
  if (!types.isIdentifier(hook.callee)) {
    return undefined;
  }

  if (hook.callee.name !== HOOKS.TARGET) {
    return undefined;
  }

  /**
   * - get the object in useTarget(() => ({}))
   * -
   */

  const obj = hook.arguments[0];

  if (!types.isFunctionExpression(obj) && !types.isArrowFunctionExpression(obj)) {
    return undefined;
  }

  if (!types.isObjectExpression(obj.body)) return undefined;

  const useTargetContent = obj.body.properties.map((prop) => {
    if (!types.isObjectProperty(prop)) {
      throw new Error('useTarget properties cannot be spread or references');
    }
    if (!types.isIdentifier(prop.key)) {
      throw new Error('Expected an identifier, instead got: ' + prop.key);
    }

    const targetCode = prop.value;
    if (!types.isFunctionExpression(targetCode) && !types.isArrowFunctionExpression(targetCode)) {
      return undefined;
    }

    return {
      // validate `name` content against possible targets
      target: prop.key.name,

      code: types.isBlockStatement(targetCode.body)
        ? // it's a function that needs to be called
          generate(targetCode.body).code
        : // expression that can be returned as-is
          generate(targetCode.body).code,
    };
  });

  return useTargetContent;
};
