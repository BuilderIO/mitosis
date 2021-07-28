import { JSXLiteNode } from '../types/mitosis-node';

export const isJsxLiteNode = (thing: unknown): thing is JSXLiteNode => {
  return Boolean(
    thing && (thing as any)['@type'] === '@builder.io/mitosis/node',
  );
};
