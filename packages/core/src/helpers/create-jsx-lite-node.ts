import { JSXLiteNode } from '../types/jsx-lite-node';

export const createJSXLiteNode = (
  options: Partial<JSXLiteNode>,
): JSXLiteNode => ({
  '@type': '@jsx-lite/node',
  name: 'div',
  meta: {},
  properties: {},
  bindings: {},
  children: [],
  ...options,
});
