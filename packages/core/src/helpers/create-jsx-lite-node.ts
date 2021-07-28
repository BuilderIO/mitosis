import { JSXLiteNode } from '../types/mitosis-node';

export const createJSXLiteNode = (
  options: Partial<JSXLiteNode>,
): JSXLiteNode => ({
  '@type': '@builder.io/mitosis/node',
  name: 'div',
  meta: {},
  properties: {},
  bindings: {},
  children: [],
  ...options,
});
