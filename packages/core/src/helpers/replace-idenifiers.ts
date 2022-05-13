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
        // This is not an (optional) property access - like `foo` in `this.foo` or `this?.foo`
        !(
          (types.isMemberExpression(path.parent) ||
            types.isOptionalMemberExpression(path.parent)) &&
          path.parent.property === path.node
        ) &&
        // This is no the function name - like `foo` in `function foo() {}`
        !(
          types.isFunctionDeclaration(path.parent) &&
          path.parent.id === path.node
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
