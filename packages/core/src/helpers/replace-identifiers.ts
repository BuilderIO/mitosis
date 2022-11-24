import { types } from '@babel/core';
import { babelTransformExpression } from './babel-transform';

type ReplaceArgs = {
  code: string;
  from: string | string[];
  to?: string | ((identifier: string) => string);
};

const _replaceIdentifiers = (
  path: babel.NodePath<types.MemberExpression | types.OptionalMemberExpression>,
  { from, to }: Pick<ReplaceArgs, 'from' | 'to'>,
) => {
  const memberExpressionObject = path.node.object;

  if (!types.isIdentifier(memberExpressionObject)) {
    return;
  }

  const normalizedFrom = Array.isArray(from) ? from : [from];

  const objName = memberExpressionObject.name;
  const matchesFrom = normalizedFrom.includes(objName);

  if (matchesFrom) {
    if (!to) {
      path.replaceWith(path.node.property);
    } else {
      path.replaceWith(
        types.memberExpression(
          types.identifier(typeof to === 'string' ? to : to(memberExpressionObject.name)),
          path.node.property,
        ),
      );
    }
  }
};

export const replaceIdentifiers = ({ code, from, to }: ReplaceArgs) =>
  babelTransformExpression(code, {
    MemberExpression(path) {
      _replaceIdentifiers(path, { from, to });
    },
    OptionalMemberExpression(path) {
      _replaceIdentifiers(path, { from, to });
    },
  });
