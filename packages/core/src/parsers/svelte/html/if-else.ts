import { generate } from 'astring';

import { parseHtmlNode } from '.';
import { createMitosisNode } from '../helpers/mitosis-node';
import { parseChildren } from '../helpers/children';

import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import type { SveltosisComponent } from '../types';
import { createSingleBinding } from '../../../helpers/bindings';

export function parseIfElse(json: SveltosisComponent, node: TemplateNode) {
  const mitosisNode = createMitosisNode();
  mitosisNode.name = 'Show';
  mitosisNode.bindings = {
    when: createSingleBinding({
      code: generate(node.expression),
    }),
  };

  mitosisNode.children = parseChildren(json, node);

  if (node.else) {
    mitosisNode.meta.else =
      node.else.children?.length === 1
        ? parseHtmlNode(json, node.else.children[0])
        : {
            ...createMitosisNode(),
            name: 'div',
            children: node.else.children?.map((n: TemplateNode) => parseHtmlNode(json, n)) ?? [],
          };
  }
  return mitosisNode;
}
