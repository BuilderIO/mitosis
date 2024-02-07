import { MitosisNode } from '../types/mitosis-node';

export const isEmptyTextNode = (node: MitosisNode) => {
  return typeof node.properties._text === 'string' && node.properties._text.trim().length === 0;
};

export const filterEmptyTextNodes = (node: MitosisNode) => !isEmptyTextNode(node);
