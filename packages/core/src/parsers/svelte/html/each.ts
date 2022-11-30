import { createMitosisNode } from '../helpers/mitosis-node';
import { parseChildren } from '../helpers/children';
import generate from '@babel/generator';

import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import type { SveltosisComponent } from '../types';

export function parseEach(json: SveltosisComponent, node: TemplateNode) {
  return {
    ...createMitosisNode(),
    name: 'For',
    scope: { forName: node.context.name },
    bindings: {
      each: {
        code: generate(node.expression).code!,
      },
    },
    children: parseChildren(json, node),
  };
}
