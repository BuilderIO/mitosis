import * as babel from '@babel/core';
import generate from '@babel/generator';
import {
  __DO_NOT_USE_FUNCTION_LITERAL_PREFIX,
  __DO_NOT_USE_METHOD_LITERAL_PREFIX,
} from '../constants/outdated-prefixes';
import { MitosisComponent } from '../../types/mitosis-component';
import traverse from 'traverse';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { capitalize } from '../../helpers/capitalize';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { replaceIdentifiers } from '../../helpers/replace-identifiers';
import { parseCodeJson, uncapitalize } from './helpers';
import { flow, pipe } from 'fp-ts/lib/function';
import { JSONObject } from '../../types/json';
import { mapJsonObjectToStateValue } from '../helpers/state';

const { types } = babel;

function mapReactIdentifiersInExpression(expression: string, stateProperties: string[]) {
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
export function mapReactIdentifiers(json: MitosisComponent) {
  const stateProperties = Object.keys(json.state);

  for (const key in json.state) {
    const stateVal = json.state[key];
    if (typeof stateVal?.code === 'string' && stateVal.type === 'function') {
      json.state[key] = {
        code: mapReactIdentifiersInExpression(stateVal.code, stateProperties),
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
            code: mapReactIdentifiersInExpression(value.code as string, stateProperties),
          };
          if (value.arguments?.length) {
            item.bindings[key]!.arguments = value.arguments;
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

const createFunctionStringLiteralObjectProperty = (
  key: babel.types.Expression | babel.types.PrivateName,
  node: babel.types.Node,
) =>
  types.objectProperty(
    key,
    types.stringLiteral(`${__DO_NOT_USE_FUNCTION_LITERAL_PREFIX}${generate(node).code}`),
  );

type ParsedStateValue = babel.types.ObjectProperty | babel.types.SpreadElement;

const parseStateValue = (
  item: babel.types.ObjectMethod | babel.types.ObjectProperty | babel.types.SpreadElement,
): ParsedStateValue => {
  if (types.isObjectProperty(item)) {
    if (types.isFunctionExpression(item.value) || types.isArrowFunctionExpression(item.value)) {
      return createFunctionStringLiteralObjectProperty(item.key, item.value);
    }
  }
  if (types.isObjectMethod(item)) {
    return types.objectProperty(
      item.key,
      types.stringLiteral(
        `${__DO_NOT_USE_METHOD_LITERAL_PREFIX}${generate({ ...item, returnType: null }).code}`,
      ),
    );
  }
  // Remove typescript types, e.g. from
  // { foo: ('string' as SomeType) }
  if (types.isObjectProperty(item)) {
    let value = item.value;
    if (types.isTSAsExpression(value)) {
      value = value.expression;
    }
    return types.objectProperty(item.key, value);
  }
  return item;
};

export const parseStateObject = (object: babel.types.ObjectExpression): JSONObject =>
  pipe(object.properties, (p) => p.map(parseStateValue), types.objectExpression, parseCodeJson);

export const parseStateObjectToMitosisState = flow(parseStateObject, mapJsonObjectToStateValue);
