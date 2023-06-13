import * as babel from '@babel/core';
import generate from '@babel/generator';

const { types } = babel;

export const getHook = (node: babel.Node) => {
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

export const processHookCode = (
  firstArg: babel.types.ArrowFunctionExpression | babel.types.FunctionExpression,
) =>
  generate(firstArg.body)
    .code.trim()
    // Remove arbitrary block wrapping if any
    // AKA
    //  { console.log('hi') } -> console.log('hi')
    .replace(/^{/, '')
    .replace(/}$/, '')
    .trim();
