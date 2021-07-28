import { JSXLiteNode } from '../types/mitosis-node';

export default function isChildren(node: JSXLiteNode): boolean {
  return (
    `${node.bindings._text || ''}`.replace(/\s+/g, '') === 'props.children'
  );
}
