import { types } from '@babel/core';
import generate from '@babel/generator';
import { pipe } from 'fp-ts/lib/function';
import { babelTransformExpression } from './babel-transform';

/**
 * Type hack.
 *
 * We want to augment the `BaseNode` interface to include a `_builder_meta` property but couldn't get
 * `yarn patch-package` to cooperate with us. So we're doing it this way.
 */
type AllowMeta<T = types.Node> = T & {
  _builder_meta?: {
    newlyGenerated: boolean;
  };
};

export type ReplaceTo =
  | string
  | ((accessedProperty: string, matchedIdentifier: string) => string)
  | null;

type ReplaceArgs = {
  code: string;
  from: string | string[];
  to: ReplaceTo;
};

export type NodeMap = {
  from: types.Node;
  condition?: (path: babel.NodePath<types.Node>) => boolean;
  to: types.Node;
};

/**
 * Given a `to` function given by the user, figure out the best argument to provide to the `to` function.
 * This function makes a best guess based on the AST structure it's dealing with.
 */
const getToParam = (
  path: babel.NodePath<types.Identifier | types.MemberExpression | types.OptionalMemberExpression>,
): string => {
  if (types.isMemberExpression(path.node) || types.isOptionalMemberExpression(path.node)) {
    if (types.isIdentifier(path.node.property)) {
      // if simple member expression e.g. `props.foo`, returns `foo`
      const propertyName = path.node.property.name;
      return propertyName;
    } else {
      // if nested member expression e.g. `props.foo.bar.baz`, returns `foo.bar.baz`
      const x = generate(path.node.property).code;
      return x;
    }
  } else {
    // if naked identifier e.g. `foo`, returns `foo`
    const nodeName = path.node.name;
    return nodeName;
  }
};

const _replaceIdentifiers = (
  path: babel.NodePath<types.MemberExpression | types.OptionalMemberExpression | types.Identifier>,
  { from, to }: Pick<ReplaceArgs, 'from' | 'to'>,
) => {
  const memberExpressionObject = types.isIdentifier(path.node) ? path.node : path.node.object;
  const normalizedFrom = Array.isArray(from) ? from : [from];

  if (
    !types.isIdentifier(memberExpressionObject) ||
    (path.node as AllowMeta)?._builder_meta?.newlyGenerated
  ) {
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
            (x) => to(x, memberExpressionObject.name),
            (expression) => {
              const [head, ...tail] = expression.split('.');
              return [head, tail.join('.')];
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

          /**
           * If both `path` and `newMemberExpression` are equal nodes, do nothing.
           * This is to prevent infinite loops when the user-provided `to` function returns the same identifier.
           *
           * The infinite loop probably happens because we end up traversing the new `Identifier` node again?
           */
          if (generate(path.node).code === generate(newMemberExpression).code) {
            return;
          }
          (newMemberExpression as AllowMeta)._builder_meta = { newlyGenerated: true };
          path.replaceWith(newMemberExpression);
        } catch (err) {
          console.debug('Could not replace node.');
          // throw err;
        }
      }
    } else {
      if (types.isIdentifier(path.node)) {
        console.debug(`Could not replace Identifier with nothing.`);
      } else {
        // if we're looking at a member expression, e.g. `props.foo` and no `to` was provided, then we want to strip out
        // the identifier and end up with `foo`. So we replace the member expression with just its `property` value.
        path.replaceWith(path.node.property);
      }
    }
  }
};

/**
 * @deprecated Use `replaceNodes` instead.
 */
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
            !types.isFunctionDeclaration(path.parent) &&
            // variable declaration identifiers shouldn't be transformed
            // !(types.isVariableDeclarator(path.parent) && path.parent.id === path.node)
            // object -> { detail: { state: 'something' } } shouldn't be transformed to { detail: { this: 'something' } }
            !types.isObjectProperty(path.parent)
          ) {
            _replaceIdentifiers(path, { from, to });
          }
        },
      }),
      // merely running `babel.transform` will add spaces around the code, even if we don't end up replacing anything.
      // we have some other code downstream that cannot have untrimmed spaces, so we need to trim the output.
      (code) => code.trim(),
    );
  } catch (err) {
    throw err;
  }
};

export const replaceStateIdentifier = (to: ReplaceArgs['to']) => (code: string) =>
  replaceIdentifiers({ code, from: 'state', to });

export const replacePropsIdentifier = (to: ReplaceArgs['to']) => (code: string) =>
  replaceIdentifiers({ code, from: 'props', to });

const isNewlyGenerated = (node: types.Node) => (node as AllowMeta)?._builder_meta?.newlyGenerated;

/**
 * Replaces all instances of a Babel AST Node with a new Node within a code string.
 * Uses `generate()` to convert the Node to a string and compare them.
 */
export const replaceNodes = ({ code, nodeMaps }: { code: string; nodeMaps: NodeMap[] }) => {
  const searchAndReplace = (path: babel.NodePath<types.Node>) => {
    if (isNewlyGenerated(path.node) || isNewlyGenerated(path.parent)) return;

    for (const { from, to, condition } of nodeMaps) {
      if (isNewlyGenerated(path.node) || isNewlyGenerated(path.parent)) return;
      // if (path.node.type !== from.type) return;

      const matchesCondition = condition ? condition(path) : true;

      if (generate(path.node).code === generate(from).code && matchesCondition) {
        const x = types.cloneNode(to);
        (x as AllowMeta)._builder_meta = { newlyGenerated: true };
        try {
          path.replaceWith(x);
        } catch (err) {
          console.log('error replacing', {
            code,
            orig: generate(path.node).code,
            to: generate(x).code,
          });
          // throw err;
        }
      }
    }
  };

  return babelTransformExpression(code, {
    ThisExpression(path) {
      searchAndReplace(path);
    },
    MemberExpression(path) {
      searchAndReplace(path);
    },
    Identifier(path) {
      searchAndReplace(path);
    },
    OptionalMemberExpression(path) {
      searchAndReplace(path);
    },
  });
};
