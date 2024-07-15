import traverse from 'neotraverse';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';

export const getRefs = (json: MitosisComponent) => {
  const refs = new Set<string>();
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      if (typeof item.bindings.ref?.code === 'string') {
        refs.add(item.bindings.ref.code);
      }
    }
  });

  return refs;
};
