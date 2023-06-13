import * as babel from '@babel/core';
import generate from '@babel/generator';
import { HOOKS } from '../../constants/hooks';
import { getHook } from './helpers/hooks';
import { ParseMitosisOptions } from './types';

const { types } = babel;

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
      // TO-DO: validate `name` content against possible targets
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
