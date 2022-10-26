import { types } from '@babel/core';
import { babelTransformExpression } from './babel-transform';

const checkShouldReplaceIdentifier = (path: babel.NodePath<babel.types.Identifier>) => {
  // Identifier should not be an (optional) property access - like `foo` in `this.foo` or `this?.foo`
  const isPropertyAccess =
    (types.isMemberExpression(path.parent) || types.isOptionalMemberExpression(path.parent)) &&
    path.parent.property === path.node;

  if (isPropertyAccess) {
    return false;
  }

  // Identifier should not be a function name - like `foo` in `function foo() {}`
  const isFunctionName = types.isFunctionDeclaration(path.parent) && path.parent.id === path.node;

  if (isFunctionName) {
    return false;
  }

  return true;
};

export const replaceIdentifiers = ({
  code,
  from,
  to,
}: {
  code: string;
  from: string | string[];
  to: string | ((identifier: string) => string);
}) => {
  return babelTransformExpression(code, {
    Identifier(path: babel.NodePath<babel.types.Identifier>) {
      const matchesFrom = Array.isArray(from)
        ? from.includes(path.node.name)
        : path.node.name === from;

      if (checkShouldReplaceIdentifier(path) && matchesFrom) {
        path.replaceWith(types.identifier(typeof to === 'string' ? to : to(path.node.name)));
      }
    },
  });
};
