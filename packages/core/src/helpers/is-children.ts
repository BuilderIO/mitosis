import { MitosisNode } from '../types/mitosis-node';

export default function isChildren({
  node,
  extraMatches = [],
}: {
  node: MitosisNode;
  extraMatches?: string[];
}): boolean {
  const textValue = node.bindings._text?.code || node.properties.__text || '';
  const trimmedTextValue = textValue.replace(/\s+/g, '');
  return ['props.children', 'children'].concat(extraMatches).includes(trimmedTextValue);
}
