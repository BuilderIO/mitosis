import { JSON } from "./json";

export type JSXLiteNode = {
  '@type': '@jsx-lite/node';
  name: string;
  properties: { [key: string]: JSON };
  // Separate actions?
  bindings: { [key: string]: JSON };
  children: JSXLiteNode[];
};
