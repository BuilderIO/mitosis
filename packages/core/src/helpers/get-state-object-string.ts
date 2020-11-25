import json5 from 'json5';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { JSXLiteComponent } from '../types/jsx-lite-component';

export type GetStateObjectStringOptions = {
  data?: boolean;
  functions?: boolean;
  getters?: boolean;
  valueMapper?: (code: string, type: 'data' | 'function' | 'getter') => string;
  format?: 'object' | 'class' | 'variables';
  keyPrefix?: string;
};

export const getStateObjectString = (
  component: JSXLiteComponent,
  options: GetStateObjectStringOptions = {},
) => {
  const format = options.format || 'object';
  let str = format === 'object' ? '{' : '';

  const { state } = component;

  const valueMapper = options.valueMapper || ((val: string) => val);

  const keyValueDelimiter = format === 'object' ? ':' : '=';
  const lineItemDelimiter = format === 'object' ? ',' : '\n';
  const keyPrefix = options.keyPrefix || '';

  for (const key in state) {
    const value = state[key];
    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        if (options.functions === false) {
          continue;
        }
        const functionValue = value.replace(functionLiteralPrefix, '');
        str += ` ${keyPrefix} ${key} ${keyValueDelimiter} ${valueMapper(
          functionValue,
          'function',
        )}${lineItemDelimiter} `;
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
          isGet ? 'getter' : 'function',
        )} ${lineItemDelimiter}`;
      } else {
        if (options.data === false) {
          continue;
        }
        str += ` ${keyPrefix} ${key}${keyValueDelimiter} ${valueMapper(
          json5.stringify(value),
          'data',
        )}${lineItemDelimiter} `;
      }
    } else {
      if (options.data === false) {
        continue;
      }
      str += ` ${keyPrefix} ${key}${keyValueDelimiter} ${valueMapper(
        json5.stringify(value),
        'data',
      )}${lineItemDelimiter} `;
    }
  }

  str += format === 'object' ? '}' : '';
  return str;
};
