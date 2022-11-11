import * as babel from '@babel/core';
import json5 from 'json5';
import generate from '@babel/generator';

import { MitosisComponent, MitosisState, StateValue } from '../../types/mitosis-component';
import traverse from 'traverse';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { capitalize } from '../../helpers/capitalize';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { replaceIdentifiers } from '../../helpers/replace-identifiers';
import { uncapitalize } from './helpers';

const { types } = babel;

function mapStateIdentifiersInExpression(expression: string, stateProperties: string[]) {
  const setExpressions = stateProperties.map((propertyName) => `set${capitalize(propertyName)}`);

  return babelTransformExpression(
    // foo -> state.foo
    replaceIdentifiers({ code: expression, from: stateProperties, to: (name) => `state.${name}` }),
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
  );
}

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
        const value = item.bindings[key];

        if (value) {
          item.bindings[key] = {
            code: mapStateIdentifiersInExpression(value.code, stateProperties),
          };
          if (value.arguments?.length) {
            item.bindings[key]!.arguments = value.arguments;
          }
          if (value.type?.length) {
            item.bindings[key]!.type = value.type;
          }
        }
      }

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
        console.warn(`[${json.name}]: Ended up with both a property and binding for 'class'.`);
      }
    }
  });
}

const processStateObjectSlice = (
  item: babel.types.ObjectMethod | babel.types.ObjectProperty,
): StateValue => {
  if (types.isObjectProperty(item)) {
    if (types.isFunctionExpression(item.value)) {
      return {
        code: generate(item.value).code,
        type: 'function',
      };
    } else if (types.isArrowFunctionExpression(item.value)) {
      const n = babel.types.objectMethod(
        'method',
        item.key as babel.types.Expression,
        item.value.params,
        item.value.body as babel.types.BlockStatement,
      );
      const code = generate(n).code;
      if (code.includes('Builder.isEditing')) {
        console.log('OOG', n);
      }
      return {
        code: code,
        type: 'method',
      };
    } else {
      // Remove typescript types, e.g. from
      // { foo: ('string' as SomeType) }
      if (types.isTSAsExpression(item.value)) {
        return {
          code: json5.parse(generate(item.value.expression).code),
          type: 'property',
        };
      }
      return {
        code: json5.parse(generate(item.value).code),
        type: 'property',
      };
    }
  } else if (types.isObjectMethod(item)) {
    const n = generate({ ...item, returnType: null }).code;
    if (n.includes('Builder.isEditing')) {
      console.log('OOG', n);
    }

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

    state[x.key.name] = processStateObjectSlice(x);
  });

  return state;
};
