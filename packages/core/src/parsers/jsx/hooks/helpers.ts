import * as babel from '@babel/core';

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
