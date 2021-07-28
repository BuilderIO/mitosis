import { MitosisNode } from '../types/mitosis-node';

export const filterEmptyTextNodes = (node: MitosisNode) =>
  !(
    typeof node.properties._text === 'string' &&
    !node.properties._text.trim().length
  );
