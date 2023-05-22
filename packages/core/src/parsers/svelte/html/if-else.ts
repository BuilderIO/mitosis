import { generate } from 'astring';

import { parseHtmlNode } from '.';
import { parseChildren } from '../helpers/children';
import { createMitosisNode } from '../helpers/mitosis-node';

import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import { createSingleBinding } from '../../../helpers/bindings';
import type { SveltosisComponent } from '../types';

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
