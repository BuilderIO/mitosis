import { JSON } from "./json";
import { JSXLiteNode } from "./jsx-lite-node";

export type JSXLiteComponent = {
  '@type': '@jsx-lite/component';
  state: { [key: string]: JSON };
  children: JSXLiteNode[];
};
