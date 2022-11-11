import { upperFirst } from 'lodash';
import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import { parseChildren } from '../helpers/children';
import { createMitosisNode } from '../helpers/mitosis-node';

export function parseSlot(json: SveltosisComponent, node: TemplateNode) {
  const mitosisNode = createMitosisNode();
  if (
    node.attributes.length > 0 &&
    node.attributes[0].value.length > 0 &&
    node.attributes[0].value[0].data?.trim().length
  ) {
    mitosisNode.name = 'div';
    const slotName = upperFirst(node.attributes[0].value[0]?.data);

    mitosisNode.bindings._text = {
      code: `props.slot${slotName}`,
    };
  } else {
    mitosisNode.name = 'Slot';
  }

  mitosisNode.children = parseChildren(json, node);

  return mitosisNode;
}
