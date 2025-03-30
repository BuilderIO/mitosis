import { MitosisNode } from '@/types/mitosis-node';

export const getBuilderTagName = (node: MitosisNode) => {
  return node.properties.$tagName;
};
