import { MitosisNode } from '../types/mitosis-node';

export default function isChildren(node: MitosisNode): boolean {
  return (
    `${node.bindings._text?.code || node.properties.__text || ''}`.replace(/\s+/g, '') ===
    'props.children'
  );
}
