import { types } from '@babel/core';
import { babelTransformExpression } from './babel-transform';

export const replaceIdentifiers = (
  code: string,
  from: string | string[],
  to: string | ((identifier: string) => string),
) => {
  return babelTransformExpression(code, {
    Identifier(path: babel.NodePath<babel.types.Identifier>) {
      if (
        // TODO: other exclusions
        !(
          types.isMemberExpression(path.parent) &&
          path.parent.property === path.node
        ) &&
        (Array.isArray(from)
          ? from.includes(path.node.name)
          : path.node.name === from)
      ) {
        path.replaceWith(
          types.identifier(typeof to === 'string' ? to : to(path.node.name)),
        );
      }
    },
  });
};
