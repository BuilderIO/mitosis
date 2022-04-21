import json5 from 'json5';
import { JSONObject, JSON } from '../types/json';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { MitosisComponent } from '../types/mitosis-component';
import { GETTER } from './patterns';

export type GetStateObjectStringOptions = {
  data?: boolean;
  functions?: boolean;
  getters?: boolean;
  valueMapper?: (code: string, type: 'data' | 'function' | 'getter') => string;
  format?: 'object' | 'class' | 'variables';
  keyPrefix?: string;
};

const convertStateMemberToString =
  (options: GetStateObjectStringOptions) =>
  ([key, value]: [string, JSON]) => {
    const valueMapper = options.valueMapper || ((val: string) => val);
    const keyValueDelimiter = options.format === 'object' ? ':' : '=';
    const keyPrefix = options.keyPrefix || '';

    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        if (options.functions === false) {
          return undefined;
        }
        const functionValue = value.replace(functionLiteralPrefix, '');
        return `${keyPrefix} ${key} ${keyValueDelimiter} ${valueMapper(
          functionValue,
          'function',
        )}`;
      } else if (value.startsWith(methodLiteralPrefix)) {
        const methodValue = value.replace(methodLiteralPrefix, '');
        const isGet = Boolean(methodValue.match(GETTER));
        if (isGet && options.getters === false) {
          return undefined;
        }
        if (!isGet && options.functions === false) {
          return undefined;
        }
        return `${keyPrefix} ${valueMapper(
          methodValue,
          isGet ? 'getter' : 'function', // TODO: create a separate method type
        )}`;
      }
    }

    if (options.data === false) {
      return undefined;
    }
    return `${keyPrefix} ${key}${keyValueDelimiter} ${valueMapper(
      json5.stringify(value),
      'data',
    )}`;
  };

export const getMemberObjectString = (
  object: JSONObject,
  options: GetStateObjectStringOptions = {},
) => {
  const format = options.format || 'object';
  const lineItemDelimiter = format === 'object' ? ',' : '\n';

  const stringifiedProperties = Object.entries(object)
    .map(convertStateMemberToString({ ...options, format }))
    .filter((x) => x !== undefined)
    .join(lineItemDelimiter);

  const prefix = format === 'object' ? '{' : '';
  const suffix = format === 'object' ? '}' : '';

  // NOTE: we add a `lineItemDelimiter` at the very end because other functions will sometimes append more properties.
  // If the delimiter is a comma and the format is `object`, then we need to make sure we have an extra comma at the end,
  // or the object will become invalid JS.
  // We also have to make sure that `stringifiedProperties` isn't empty, or we will get `{,}` which is invalid
  const extraDelimiter =
    stringifiedProperties.length > 0 ? lineItemDelimiter : '';

  return `${prefix}${stringifiedProperties}${extraDelimiter}${suffix}`;
};

export const getStateObjectStringFromComponent = (
  component: MitosisComponent,
  options: GetStateObjectStringOptions = {},
) => {
  const stateObjectStr = getMemberObjectString(component.state, options);

  return stateObjectStr;
};
