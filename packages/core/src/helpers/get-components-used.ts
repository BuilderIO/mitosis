import traverse from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';

export function getComponentsUsed(json: MitosisComponent) {
  const components = new Set<string>();

  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      components.add(item.name);
    }
  });

  return components;
}
