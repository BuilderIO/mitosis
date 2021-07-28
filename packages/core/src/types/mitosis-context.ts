import { JSONObject } from './json';

export type MitosisContext = {
  '@type': '@builder.io/mitosis/context';
  name: string;
  value: JSONObject; // TODO: support non objects too
};
