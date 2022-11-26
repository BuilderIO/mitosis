import { types } from '@babel/core';
import { pipe } from 'fp-ts/lib/function';
import { babelTransformExpression } from './babel-transform';

type ReplaceArgs = {
  code: string;
  from: string | string[];
  to: string | ((identifier: string) => string) | null;
};

const _replaceIdentifiers = (
  path: babel.NodePath<types.MemberExpression | types.OptionalMemberExpression | types.Identifier>,
  { from, to }: Pick<ReplaceArgs, 'from' | 'to'>,
) => {
  const memberExpressionObject = types.isIdentifier(path.node) ? path.node : path.node.object;
  const normalizedFrom = Array.isArray(from) ? from : [from];

  if (!types.isIdentifier(memberExpressionObject)) {
    return;
  }

  const matchesFrom = normalizedFrom.includes(memberExpressionObject.name);

  if (matchesFrom) {
    if (to) {
      const newIdentifier = typeof to === 'string' ? to : to(memberExpressionObject.name);
      const cleanedIdentifier = pipe(
        newIdentifier.endsWith('.')
          ? newIdentifier.substring(0, newIdentifier.length - 1)
          : newIdentifier,
        types.identifier,
      );

      if (types.isIdentifier(path.node)) {
        path.replaceWith(cleanedIdentifier);
      } else {
        path.replaceWith(types.memberExpression(cleanedIdentifier, path.node.property));
      }
    } else {
      if (types.isIdentifier(path.node)) {
        console.error(`could not replace Identifier '${from.toString()}' with nothing.`);
      } else {
        path.replaceWith(path.node.property);
      }
    }
  }
};

export const replaceIdentifiers = ({ code, from, to }: ReplaceArgs) => {
  const isGetter = code.trim().startsWith('get ');
  const newCode = code.trim().replace(/^get /, 'function ');

  try {
    const transformed = babelTransformExpression(newCode, {
      MemberExpression(path) {
        _replaceIdentifiers(path, { from, to });
      },
      OptionalMemberExpression(path) {
        _replaceIdentifiers(path, { from, to });
      },
      Identifier(path) {
        // we only want to ignore certain identifiers:
        if (
          // (optional) member expressions are already handled in other visitors
          !types.isMemberExpression(path.parent) &&
          !types.isOptionalMemberExpression(path.parent) &&
          // function declaration identifiers shouldn't be transformed
          !types.isFunctionDeclaration(path.parent)
        ) {
          _replaceIdentifiers(path, { from, to });
        }
      },
    });
    return isGetter ? transformed.trim().replace(/^function /, 'get ') : transformed;
  } catch (err) {
    console.log('could not replace identifiers for ', code);
    return code;
  }
};
