import { JSXLiteNode } from '../types/jsx-lite-node';

export default function isChildren(node: JSXLiteNode): boolean {
  return (
    `${node.bindings._text || ''}`.replace(/\s+/g, '') === 'props.children'
  );
}
