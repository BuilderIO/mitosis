import traverse from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';

export const getRefs = (json: MitosisComponent, refKey: string = 'ref') => {
  const refs = new Set<string>();
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      const binding = item.bindings[refKey];
      if (binding && typeof binding.code === 'string') {
        refs.add(binding.code);
      }
    }
  });

  return refs;
};
