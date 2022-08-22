import { mapValues } from 'lodash';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { JSONObject } from '../types/json';
import { MitosisComponent, StateValue } from '../types/mitosis-component';
import { GETTER } from './patterns';

export const checkHasState = (component: MitosisComponent) =>
  Boolean(Object.keys(component.state).length);

/**
 * Sets StateTypeValue based on the string prefixes we've set previously.
 *
 * This is a temporary workaround until we eliminate the prefixes and make this StateValueType the
 * source of truth.
 */
const mapJsonToStateValue = (value: any): StateValue => {
  if (typeof value === 'string') {
    if (value.startsWith(functionLiteralPrefix)) {
      return { type: 'function', code: value.replace(functionLiteralPrefix, '') };
    } else if (value.startsWith(methodLiteralPrefix)) {
      const strippedValue = value.replace(methodLiteralPrefix, '');
      const isGet = Boolean(strippedValue.match(GETTER));
      if (isGet) {
        return { type: 'getter', code: strippedValue.replace(GETTER, '') };
      }
      return { type: 'method', code: strippedValue };
    }
  }
  return { type: 'property', code: value };
};

export const mapJsonObjectToStateValue = (value: JSONObject): MitosisComponent['state'] =>
  mapValues(value, mapJsonToStateValue);
