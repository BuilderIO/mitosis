import { types } from '@babel/core';
import generate from '@babel/generator';
import { pipe } from 'fp-ts/lib/function';
import { babelTransformExpression } from './babel-transform';

type ReplaceArgs = {
  code: string;
  from: string | string[];
  to: string | ((identifier: string) => string) | null;
};

const getToParam = (
  path: babel.NodePath<types.Identifier | types.MemberExpression | types.OptionalMemberExpression>,
): string => {
  if (types.isMemberExpression(path.node) || types.isOptionalMemberExpression(path.node)) {
    // `props.foo`, returns `foo`
    if (types.isIdentifier(path.node.property)) {
      return path.node.property.name;
    } else {
      // `props.foo.bar.baz`, returns `foo.bar.baz`
      return generate(path.node.property).code;
    }
  } else {
    // `load`, returns `load`
    return path.node.name;
  }
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
      // `props.foo` to `state`, e.g. `state.foo`
      if (typeof to === 'string') {
        const cleanedIdentifier = pipe(
          to.endsWith('.') ? to.substring(0, to.length - 1) : to,
          types.identifier,
        );

        if (types.isIdentifier(path.node)) {
          path.replaceWith(cleanedIdentifier);
        } else {
          path.replaceWith(types.memberExpression(cleanedIdentifier, path.node.property));
        }

        // `props.foo` to (name) => `state.${name}.bar`, e.g. `state.foo.bar`
      } else {
        const newMemberExpression = pipe(
          getToParam(path),
          to,
          (expression) => {
            const [head, ...tail] = expression.split('.');
            return [head, tail.join('')];
          },
          ([obj, prop]) => {
            return types.memberExpression(types.identifier(obj), types.identifier(prop));
          },
        );
        path.replaceWith(newMemberExpression);
      }
    } else {
      if (types.isIdentifier(path.node)) {
        console.error(`could not replace Identifier '${from.toString()}' with nothing.`);
      } else {
        // if we're looking at a member expression, e.g. `props.foo` and no `to` was provided, then we want to strip out
        // the identifier and end up with `foo`. So we replace the member expression with just its `property` value.
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
    const newLocal = isGetter ? transformed.trim().replace(/^function /, 'get ') : transformed;
    return newLocal;
  } catch (err) {
    console.log('could not replace identifiers for ', code);
    return code;
  }
};
