import { generate } from 'astring';
import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import { createMitosisNode } from '../helpers/mitosis-node';

export function parseMustacheTag(node: TemplateNode) {
  const mitosisNode = createMitosisNode();
  mitosisNode.name = 'div';
  mitosisNode.bindings['_text'] = {
    code: generate(node.expression),
  };
  return mitosisNode;
}

export function parseRawMustacheTag(node: TemplateNode) {
  const mitosisNode = createMitosisNode();
  mitosisNode.name = 'div';
  mitosisNode.bindings.innerHTML = {
    code: generate(node.expression),
  };
  return mitosisNode;
}
