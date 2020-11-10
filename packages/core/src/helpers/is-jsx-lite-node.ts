import { JSXLiteNode } from '../types/jsx-lite-node';

export const isJsxLiteNode = (thing: unknown): thing is JSXLiteNode => {
  return Boolean(thing && (thing as any)['@type'] === '@jsx-lite/node');
};
