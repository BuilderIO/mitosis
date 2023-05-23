import { parseChildren } from '../helpers/children';
import { createMitosisNode } from '../helpers/mitosis-node';

import type { TemplateNode } from 'svelte/types/compiler/interfaces';
import { createSingleBinding } from '../../../helpers/bindings';
import { MitosisNode } from '../../../types/mitosis-node';
import type { SveltosisComponent } from '../types';

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
