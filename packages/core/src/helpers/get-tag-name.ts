import { MitosisNode } from '..';

export const getBuilderTagName = (node: MitosisNode) => {
  return node.properties.$tagName;
};
