import json5 from "json5";
import { functionLiteralPrefix } from "../constants/function-literal-prefix";
import { methodLiteralPrefix } from "../constants/method-literal-prefix";
import { JSXLiteComponent } from "../types/jsx-lite-component";

export const getStateObjectString = (component: JSXLiteComponent) => {
  let str = '{';

  const { state } = component;

  for (const key in state) {
    const value = state[key];
    if (typeof value === 'string') {
      if (value.startsWith(functionLiteralPrefix)) {
        str += ` ${key}: ${value.replace(functionLiteralPrefix, '')}, `;
      } else if (value.startsWith(methodLiteralPrefix)) {
        str += ` ${value.replace(methodLiteralPrefix, '')} ,`;
      } else {
        str += ` ${key}: ${json5.stringify(value)}, `;
      }
    }
  }

  str += '}';
  return str;
};
