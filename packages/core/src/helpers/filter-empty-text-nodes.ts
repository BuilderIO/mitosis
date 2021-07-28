import { JSXLiteNode } from '../types/mitosis-node';

export const filterEmptyTextNodes = (node: JSXLiteNode) =>
  !(
    typeof node.properties._text === 'string' &&
    !node.properties._text.trim().length
  );
