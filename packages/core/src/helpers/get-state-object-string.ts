import json5 from 'json5';
import { functionLiteralPrefix } from '../constants/function-literal-prefix';
import { methodLiteralPrefix } from '../constants/method-literal-prefix';
import { JSXLiteComponent } from '../types/jsx-lite-component';

export type GetStateObjectStringOptions = {
  data?: boolean;
  functions?: boolean;
  getters?: boolean;
  valueMapper?: (code: string, type: 'data' | 'function' | 'getter') => string;
};

export const getStateObjectString = (
  component: JSXLiteComponent,
  options: GetStateObjectStringOptions = {},
) => {
  let str = '{';

  const { state } = component;

  const valueMapper = options.valueMapper || ((val: string) => val);

  for (const key in state) {
    const value = state[key];
    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        if (options.functions === false) {
          continue;
        }
        const functionValue = value.replace(functionLiteralPrefix, '');
        str += ` ${key}: ${valueMapper(functionValue, 'function')}, `;
      } else if (value.startsWith(methodLiteralPrefix)) {
        const methodValue = value.replace(methodLiteralPrefix, '');
        const isGet = Boolean(methodValue.match(/^get /));
        if (isGet && options.getters === false) {
          continue;
        }
        if (!isGet && options.functions === false) {
          continue;
        }
        str += ` ${valueMapper(methodValue, isGet ? 'getter' : 'function')} ,`;
      } else {
        if (options.data === false) {
          continue;
        }
        str += ` ${key}: ${valueMapper(json5.stringify(value), 'data')}, `;
      }
    }
  }

  str += '}';
  return str;
};
