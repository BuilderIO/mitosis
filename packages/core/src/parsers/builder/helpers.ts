import * as babel from '@babel/core';
import generate from '@babel/generator';
import { GETTER } from '../../helpers/patterns';
import { MitosisComponent, StateValue, StateValueType } from '../../types/mitosis-component';
import { JSONObject } from '../../types/json';
import { parseCodeJson } from '../jsx/helpers';
import {
  __DO_NOT_USE_FUNCTION_LITERAL_PREFIX,
  __DO_NOT_USE_METHOD_LITERAL_PREFIX,
} from './outdated-prefixes';
import { pipe } from 'fp-ts/lib/function';
import { mapValues } from 'lodash';

const { types } = babel;
type ParsedStateValue = babel.types.ObjectProperty | babel.types.SpreadElement;

const parseStateValue = (
  item: babel.types.ObjectMethod | babel.types.ObjectProperty | babel.types.SpreadElement,
): ParsedStateValue => {
  if (types.isObjectProperty(item)) {
    if (types.isFunctionExpression(item.value)) {
      return types.objectProperty(
        item.key,
        types.stringLiteral(`${__DO_NOT_USE_FUNCTION_LITERAL_PREFIX}${generate(item.value).code}`),
      );
    } else if (types.isArrowFunctionExpression(item.value)) {
      // convert this to an object method instead
      const n = babel.types.objectMethod(
        'method',
        item.key as babel.types.Expression,
        item.value.params,
        item.value.body as babel.types.BlockStatement,
      );

      return types.objectProperty(
        item.key,
        types.stringLiteral(`${__DO_NOT_USE_METHOD_LITERAL_PREFIX}${generate(n).code}`),
      );
    } else {
      // Remove typescript types, e.g. from
      // { foo: ('string' as SomeType) }
      if (types.isTSAsExpression(item.value)) {
        return types.objectProperty(item.key, item.value.expression);
      }
      return types.objectProperty(item.key, item.value);
    }
  } else if (types.isObjectMethod(item)) {
    return types.objectProperty(
      item.key,
      types.stringLiteral(
        `${__DO_NOT_USE_METHOD_LITERAL_PREFIX}${generate({ ...item, returnType: null }).code}`,
      ),
    );
  }
  return item;
};
export const parseStateObject = (object: babel.types.ObjectExpression): JSONObject =>
  pipe(object.properties, (p) => p.map(parseStateValue), types.objectExpression, parseCodeJson);

/**
 * Sets StateTypeValue based on the string prefixes we've set previously.
 *
 * This is a temporary workaround until we eliminate the prefixes and make this StateValueType the
 * source of truth.
 */
const mapJsonToStateValue = (value: any): StateValue => {
  if (typeof value === 'string') {
    if (value.startsWith(__DO_NOT_USE_FUNCTION_LITERAL_PREFIX)) {
      return { type: 'function', code: value.replace(__DO_NOT_USE_FUNCTION_LITERAL_PREFIX, '') };
    } else if (value.startsWith(__DO_NOT_USE_METHOD_LITERAL_PREFIX)) {
      const strippedValue = value.replace(__DO_NOT_USE_METHOD_LITERAL_PREFIX, '');
      const isGet = Boolean(strippedValue.match(GETTER));
      const type: StateValueType = isGet ? 'getter' : 'method';
      return { type, code: strippedValue };
    }
  }
  return { type: 'property', code: value };
};

export const mapJsonObjectToStateValue = (value: JSONObject): MitosisComponent['state'] =>
  mapValues(value, mapJsonToStateValue);
