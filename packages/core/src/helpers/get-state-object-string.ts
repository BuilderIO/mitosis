import json5 from 'json5';
import { JSONObject } from '../types/json';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { MitosisComponent } from '../types/mitosis-component';

export type GetStateObjectStringOptions = {
  data?: boolean;
  functions?: boolean;
  getters?: boolean;
  valueMapper?: (code: string, type: 'data' | 'function' | 'getter') => string;
  format?: 'object' | 'class' | 'variables';
  keyPrefix?: string;
};

export const getMemberObjectString = (
  object: JSONObject,
  options: GetStateObjectStringOptions = {},
) => {
  const format = options.format || 'object';
  let str = format === 'object' ? '{' : '';

  const valueMapper = options.valueMapper || ((val: string) => val);

  const keyValueDelimiter = format === 'object' ? ':' : '=';
  const lineItemDelimiter = format === 'object' ? ',' : '\n';
  const keyPrefix = options.keyPrefix || '';

  for (const key in object) {
    const value = object[key];
    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        if (options.functions === false) {
          continue;
        }
        const functionValue = value.replace(functionLiteralPrefix, '');
        str += `${keyPrefix} ${key} ${keyValueDelimiter} ${valueMapper(
          functionValue,
          'function',
        )}`;
      } else if (value.startsWith(methodLiteralPrefix)) {
        const methodValue = value.replace(methodLiteralPrefix, '');
        const isGet = Boolean(methodValue.match(/^get /));
        if (isGet && options.getters === false) {
          continue;
        }
        if (!isGet && options.functions === false) {
          continue;
        }
        str += `${keyPrefix} ${valueMapper(
          methodValue,
          isGet ? 'getter' : 'function', // TODO: create a separate method type
        )}`;
      } else {
        if (options.data === false) {
          continue;
        }
        str += `${keyPrefix} ${key}${keyValueDelimiter} ${valueMapper(
          json5.stringify(value),
          'data',
        )}`;
      }
    } else {
      if (options.data === false) {
        continue;
      }
      str += `${keyPrefix} ${key}${keyValueDelimiter} ${valueMapper(
        json5.stringify(value),
        'data',
      )}`;
    }

    str += lineItemDelimiter;
  }

  str += format === 'object' ? '}' : '';
  return str;
};

export const getStateObjectStringFromComponent = (
  component: MitosisComponent,
  options: GetStateObjectStringOptions = {},
) => {
  return getMemberObjectString(component.state, options);
};
