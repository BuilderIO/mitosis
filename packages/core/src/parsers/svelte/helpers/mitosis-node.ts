import { MitosisNode } from '../../../types/mitosis-node';

export function createMitosisNode(): MitosisNode {
  return {
    '@type': '@builder.io/mitosis/node',
    name: '',
    meta: {},
    scope: {},
    children: [],
    bindings: {},
    properties: {},
    slots: {},
  };
}
