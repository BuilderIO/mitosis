import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import type { MitosisNode } from '../../../types/mitosis-node';
import { parseHtmlNode } from '../html';
import type { SveltosisComponent } from '../types';

export function filterChildren(children: TemplateNode[]) {
  return (
    children?.filter((n) => n.type !== 'Comment' && (n.type !== 'Text' || n.data?.trim().length)) ??
    []
  );
}

export function parseChildren(json: SveltosisComponent, node: TemplateNode) {
  const children: MitosisNode[] = [];

  if (node.children) {
    for (const child of filterChildren(node.children)) {
      const mitosisNode = parseHtmlNode(json, child);
      if (mitosisNode) {
        children.push(mitosisNode);
      }
    }
  }

  return children;
}
