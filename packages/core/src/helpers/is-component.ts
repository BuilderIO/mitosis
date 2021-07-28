import { JSXLiteNode } from '../types/mitosis-node';

/**
 * This node is a component, vs a plain html tag (<Foo> vs <div>)
 */
export const isComponent = (json: JSXLiteNode) =>
  json.name.toLowerCase() !== json.name;
