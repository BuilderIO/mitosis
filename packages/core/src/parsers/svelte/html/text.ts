import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import { createMitosisNode } from '../helpers/mitosis-node';

export function parseText(node: TemplateNode) {
  return {
    ...createMitosisNode(),
    name: 'div',
    properties: {
      _text: node.data,
    },
  };
}
