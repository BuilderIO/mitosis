import { mapValues } from 'lodash';
import { GETTER } from '../../helpers/patterns';
import {
  __DO_NOT_USE_METHOD_LITERAL_PREFIX,
  __DO_NOT_USE_FUNCTION_LITERAL_PREFIX,
} from '../constants/outdated-prefixes';
import { JSONObject } from '../../types/json';
import { MitosisComponent, StateValue, StateValueType } from '../../types/mitosis-component';

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
