import { MitosisNode } from '../types/mitosis-node';

export default function isChildren(node: MitosisNode): boolean {
  return (
    `${node.bindings._text?.code || ''}`.replace(/\s+/g, '') ===
    'props.children'
  );
}
