import { createMitosisNode } from '../helpers/mitosis-node';
import { parseChildren } from '../helpers/children';

import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import type { SveltosisComponent } from '../types';
import { MitosisNode } from '../../../types/mitosis-node';
import { createSingleBinding } from '../../../helpers/bindings';

export function parseEach(json: SveltosisComponent, node: TemplateNode): MitosisNode {
  return {
    ...createMitosisNode(),
    name: 'For',
    scope: { forName: node.context.name },
    bindings: {
      each: createSingleBinding({
        code: node.expression.name,
      }),
    },
    children: parseChildren(json, node),
  };
}
