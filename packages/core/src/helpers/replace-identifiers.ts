import { types } from '@babel/core';
import generate from '@babel/generator';
import { pipe } from 'fp-ts/lib/function';
import { babelTransformExpression } from './babel-transform';

type ReplaceArgs = {
  code: string;
  from: string | string[];
  to: string | ((identifier: string) => string) | null;
};

/**
 * Given a `to` function given by the user, figure out the best argument to provide to the `to` function.
 * This function makes a best guess based on the AST structure it's dealing with.
 */
const getToParam = (
  path: babel.NodePath<types.Identifier | types.MemberExpression | types.OptionalMemberExpression>,
): string => {
  if (types.isMemberExpression(path.node) || types.isOptionalMemberExpression(path.node)) {
    // if simple member expression e.g. `props.foo`, returns `foo`
    if (types.isIdentifier(path.node.property)) {
      const newLocal = path.node.property.name;
      return newLocal;
    } else {
      // if nested member expression e.g. `props.foo.bar.baz`, returns `foo.bar.baz`
      const x = generate(path.node.property).code;
      return x;
    }
  } else {
    // if naked identifier e.g. `foo`, returns `foo`
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
          // Remove trailing `.` if it exists in the user-provided string, as the dot is generated
          // by babel from the AST
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
        try {
          const newMemberExpression = pipe(
            getToParam(path),
            to,
            (expression) => {
              const [head, ...tail] = expression.split('.');
              return [head, tail.join('')];
            },
            ([obj, prop]) => {
              const objIdentifier = types.identifier(obj);
              if (prop === '') {
                return objIdentifier;
              } else {
                return types.memberExpression(objIdentifier, types.identifier(prop));
              }
            },
          );
          path.replaceWith(newMemberExpression);
        } catch (err) {
          console.error('Could not replace', path.node, 'with', to);
          // throw err;
        }
      }
    } else {
      if (types.isIdentifier(path.node)) {
        console.error(`Could not replace Identifier '${from.toString()}' with nothing.`);
      } else {
        // if we're looking at a member expression, e.g. `props.foo` and no `to` was provided, then we want to strip out
        // the identifier and end up with `foo`. So we replace the member expression with just its `property` value.
        path.replaceWith(path.node.property);
      }
    }
  }
};

export const replaceIdentifiers = ({ code, from, to }: ReplaceArgs) => {
  try {
    return pipe(
      babelTransformExpression(code, {
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
      }),
      // merely running `babel.transform` will add spaces around the code, even if we don't end up replacing anything.
      // This is why we need to trim the output.
      (code) => code.trim(),
    );
  } catch (err) {
    // console.error('could not replace identifiers for ', {
    //   code,
    //   from: from.toString(),
    //   to: to?.toString(),
    // });
    throw err;
  }
};
