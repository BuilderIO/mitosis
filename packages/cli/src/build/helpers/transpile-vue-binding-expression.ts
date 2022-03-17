import * as babel from '@babel/core';
import { babelTransformExpression } from './babel-transform-expression';

export function transpileBindingExpression(code: string) {
  if (!code.match(/\?\./)) {
    return code;
  }

  const { types } = babel;
  return babelTransformExpression(code, {
    // Replace foo?.bar -> foo && foo.barF
    OptionalMemberExpression(
      path: babel.NodePath<babel.types.OptionalMemberExpression>,
    ) {
      path.replaceWith(
        types.parenthesizedExpression(
          types.logicalExpression(
            '&&',
            path.node.object,
            types.memberExpression(path.node.object, path.node.property),
          ),
        ),
      );
    },
  });
}
