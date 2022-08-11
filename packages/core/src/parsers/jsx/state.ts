import * as babel from '@babel/core';
import generate from '@babel/generator';
import { functionLiteralPrefix } from '../../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../../constants/method-literal-prefix';
import { MitosisComponent } from '../../types/mitosis-component';
import traverse from 'traverse';
import { babelTransformExpression } from '../../helpers/babel-transform';
import { capitalize } from '../../helpers/capitalize';
import { isMitosisNode } from '../../helpers/is-mitosis-node';
import { replaceIdentifiers } from '../../helpers/replace-idenifiers';
import { parseCodeJson, uncapitalize } from './helpers';

const { types } = babel;

function mapReactIdentifiersInExpression(expression: string, stateProperties: string[]) {
  const setExpressions = stateProperties.map((propertyName) => `set${capitalize(propertyName)}`);

  return babelTransformExpression(
    // foo -> state.foo
    replaceIdentifiers(expression, stateProperties, (name) => `state.${name}`),
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
    const value = json.state[key]?.code;
    if (typeof value === 'string' && value.startsWith(functionLiteralPrefix)) {
      json.state[key] = {
        code:
          functionLiteralPrefix +
          mapReactIdentifiersInExpression(
            value.replace(functionLiteralPrefix, ''),
            stateProperties,
          ),
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
          console.warn(
            `[${json.name}]: Found both 'class' and 'className' bindings: removing 'className'.`,
          );
        } else {
          item.bindings.class = item.bindings.className;
        }
        delete item.bindings.className;
      }

      if (item.properties.className) {
        if (item.properties.class) {
          item.properties.class = `${item.properties.class} ${item.properties.className}`;
          console.warn(`[${json.name}]: Found both 'class' and 'className' properties: merging.`);
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

const createFunctionStringLiteral = (node: babel.types.Node) => {
  return types.stringLiteral(`${functionLiteralPrefix}${generate(node).code}`);
};
export const createFunctionStringLiteralObjectProperty = (
  key: babel.types.Expression | babel.types.PrivateName,
  node: babel.types.Node,
) => {
  return types.objectProperty(key, createFunctionStringLiteral(node));
};

export const parseStateObject = (object: babel.types.ObjectExpression) => {
  const properties = object.properties;
  const useProperties = properties.map((item) => {
    if (types.isObjectProperty(item)) {
      if (types.isFunctionExpression(item.value) || types.isArrowFunctionExpression(item.value)) {
        return createFunctionStringLiteralObjectProperty(item.key, item.value);
      }
    }
    if (types.isObjectMethod(item)) {
      return types.objectProperty(
        item.key,
        types.stringLiteral(
          `${methodLiteralPrefix}${generate({ ...item, returnType: null }).code}`,
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
  });

  const newObject = types.objectExpression(useProperties);
  const obj = parseCodeJson(newObject);
  return obj;
};
