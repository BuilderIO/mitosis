import { JSONObject } from '../types/json';

export type JSXLiteContext = {
  '@type': '@jsx-lite/context';
  name: string;
  value: JSONObject; // TODO: support non objects too
};
