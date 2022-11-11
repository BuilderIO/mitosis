import { createMitosisNode } from '../helpers/mitosis-node';
import { parseChildren } from '../helpers/children';

import type { TemplateNode } from 'svelte/types/compiler/interfaces';

export function parseEach(json: SveltosisComponent, node: TemplateNode) {
  return {
    ...createMitosisNode(),
    name: 'For',
    scope: { forName: node.context.name },
    bindings: {
      each: {
        code: node.expression.name,
      },
    },
    children: parseChildren(json, node),
  };
}
