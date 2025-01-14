import { MitosisNode } from '@/types/mitosis-node';

export const getTextValue = (node: MitosisNode) => {
  const textValue = node.bindings._text?.code || node.properties.__text || '';
  return textValue.replace(/\s+/g, '');
};

export default function isChildren({
  node,
  extraMatches = [],
}: {
  node: MitosisNode;
  extraMatches?: string[];
}): boolean {
  const textValue = getTextValue(node);
  return ['props.children', 'children'].concat(extraMatches).includes(textValue);
}
