import * as babel from '@babel/core';

import { MitosisNode } from '@builder.io/mitosis';
import { pipe } from 'fp-ts/lib/function';
import traverse from 'traverse';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { capitalize } from '../../helpers/capitalize';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { replaceIdentifiers } from '../../helpers/replace-identifiers';
import { MitosisComponent, MitosisState, StateValue } from '../../types/mitosis-component';
import { parseCode, uncapitalize } from './helpers';

const { types } = babel;

function mapStateIdentifiersInExpression(expression: string, stateProperties: string[]) {
  const setExpressions = stateProperties.map((propertyName) => `set${capitalize(propertyName)}`);

  return pipe(
    replaceIdentifiers({
      code: expression,
      from: stateProperties,
      to: (name) => `state.${name}`,
    }),
    (code) =>
      babelTransformExpression(
        // foo -> state.foo
        code,
        {
          CallExpression(path: babel.NodePath<babel.types.CallExpression>) {
            if (types.isIdentifier(path.node.callee)) {
              if (setExpressions.includes(path.node.callee.name)) {
                // setFoo -> foo
                const statePropertyName = uncapitalize(path.node.callee.name.slice(3));

                // setFoo(...) -> state.foo = ...
                path.replaceWith(
                  types.assignmentExpression(
                    '=',
                    types.identifier(`state.${statePropertyName}`),
                    path.node.arguments[0] as any,
                  ),
                );
              }
            }
          },
        },
      ),
    (code) => code.trim(),
  );
}

const consolidateClassBindings = (item: MitosisNode) => {
  if (item.bindings.className) {
    if (item.bindings.class) {
      // TO-DO: it's too much work to merge 2 bindings, so just remove the old one for now.
      item.bindings.class = item.bindings.className;
    } else {
      item.bindings.class = item.bindings.className;
    }
    delete item.bindings.className;
  }

  if (item.properties.className) {
    if (item.properties.class) {
      item.properties.class = `${item.properties.class} ${item.properties.className}`;
    } else {
      item.properties.class = item.properties.className;
    }
    delete item.properties.className;
  }

  if (item.properties.class && item.bindings.class) {
    console.warn(`[${item.name}]: Ended up with both a property and binding for 'class'.`);
  }
};

/**
 * Convert state identifiers from React hooks format to the state.* format Mitosis needs
 * e.g.
 *   text -> state.text
 *   setText(...) -> state.text = ...
 */
export function mapStateIdentifiers(json: MitosisComponent) {
  const stateProperties = Object.keys(json.state);

  for (const key in json.state) {
    const stateVal = json.state[key];
    if (typeof stateVal?.code === 'string' && stateVal.type === 'function') {
      json.state[key] = {
        code: mapStateIdentifiersInExpression(stateVal.code, stateProperties),
        type: 'function',
      };
    }
  }

  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      for (const key in item.bindings) {
        const value = item.bindings[key]!;
        item.bindings[key]!.code = mapStateIdentifiersInExpression(value.code, stateProperties);
      }

      consolidateClassBindings(item);
    }
  });
}

const processStateObjectSlice = (
  item: babel.types.ObjectMethod | babel.types.ObjectProperty,
): StateValue => {
  if (types.isObjectProperty(item)) {
    if (types.isFunctionExpression(item.value)) {
      return {
        code: parseCode(item.value).trim(),
        type: 'function',
      };
    } else if (types.isArrowFunctionExpression(item.value)) {
      const n = babel.types.objectMethod(
        'method',
        item.key as babel.types.Expression,
        item.value.params,
        item.value.body as babel.types.BlockStatement,
      );
      const code = parseCode(n).trim();
      return {
        code: code,
        type: 'method',
      };
    } else {
      // Remove typescript types, e.g. from
      // { foo: ('string' as SomeType) }
      if (types.isTSAsExpression(item.value)) {
        return {
          code: parseCode(item.value.expression).trim(),
          type: 'property',
        };
      }
      return {
        code: parseCode(item.value).trim(),
        type: 'property',
      };
    }
  } else if (types.isObjectMethod(item)) {
    const n = parseCode({ ...item, returnType: null }).trim();

    const isGetter = item.kind === 'get';

    return {
      code: n,
      type: isGetter ? 'getter' : 'method',
    };
  } else {
    throw new Error('Unexpected state value type', item);
  }
};

const processDefaultPropsSlice = (
  item: babel.types.ObjectMethod | babel.types.ObjectProperty,
): StateValue => {
  if (types.isObjectProperty(item)) {
    if (types.isFunctionExpression(item.value) || types.isArrowFunctionExpression(item.value)) {
      return {
        code: parseCode(item.value),
        type: 'method',
      };
    } else {
      // Remove typescript types, e.g. from
      // { foo: ('string' as SomeType) }
      if (types.isTSAsExpression(item.value)) {
        return {
          code: parseCode(item.value.expression),
          type: 'property',
        };
      }
      return {
        code: parseCode(item.value),
        type: 'property',
      };
    }
  } else if (types.isObjectMethod(item)) {
    const n = parseCode({ ...item, returnType: null });

    const isGetter = item.kind === 'get';

    return {
      code: n,
      type: isGetter ? 'getter' : 'method',
    };
  } else {
    throw new Error('Unexpected state value type', item);
  }
};

export const parseStateObjectToMitosisState = (
  object: babel.types.ObjectExpression,
  isState: boolean = true, // parse state or defaultProps
): MitosisState => {
  const state: MitosisState = {};
  object.properties.forEach((x) => {
    if (types.isSpreadElement(x)) {
      throw new Error('Parse Error: Mitosis cannot consume spread element in state object: ' + x);
    }

    if (types.isPrivateName(x.key)) {
      throw new Error('Parse Error: Mitosis cannot consume private name in state object: ' + x.key);
    }

    if (!types.isIdentifier(x.key)) {
      throw new Error(
        'Parse Error: Mitosis cannot consume non-identifier key in state object: ' + x.key,
      );
    }

    state[x.key.name] = isState ? processStateObjectSlice(x) : processDefaultPropsSlice(x);
  });

  return state;
};
