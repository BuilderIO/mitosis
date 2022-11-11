import { createMitosisNode } from '../helpers/mitosis-node';
import { parseChildren } from '../helpers/children';
import type { TemplateNode } from 'svelte/types/compiler/interfaces';

export function parseFragment(json: SveltosisComponent, node: TemplateNode) {
  let mitosisNode = createMitosisNode();

  mitosisNode.name = 'Fragment';
  mitosisNode.children = parseChildren(json, node);

  // if there is only one child, don't even bother to render the fragment as it is not necessary
  if (mitosisNode.children.length === 1) {
    mitosisNode = mitosisNode.children[0];
  }
  return mitosisNode;
}
