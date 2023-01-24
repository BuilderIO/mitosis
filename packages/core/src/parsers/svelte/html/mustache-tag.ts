import { generate } from 'astring';
import { createSingleBinding } from '../../../helpers/bindings';
import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import { createMitosisNode } from '../helpers/mitosis-node';

export function parseMustacheTag(node: TemplateNode) {
  const mitosisNode = createMitosisNode();
  mitosisNode.name = 'div';
  mitosisNode.bindings['_text'] = createSingleBinding({
    code: generate(node.expression),
  });
  return mitosisNode;
}

export function parseRawMustacheTag(node: TemplateNode) {
  const mitosisNode = createMitosisNode();
  mitosisNode.name = 'div';
  mitosisNode.bindings.innerHTML = createSingleBinding({
    code: generate(node.expression),
  });
  return mitosisNode;
}
