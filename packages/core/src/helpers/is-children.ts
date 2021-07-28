import { MitosisNode } from '../types/mitosis-node';

export default function isChildren(node: MitosisNode): boolean {
  return (
    `${node.bindings._text || ''}`.replace(/\s+/g, '') === 'props.children'
  );
}
