import traverse from 'neotraverse';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';
import { isUpperCase } from './is-upper-case';

export function getComponents(json: MitosisComponent): Set<string> {
  const components = new Set<string>();
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      if (isUpperCase(item.name[0])) {
        components.add(item.name);
      }
    }
  });

  return components;
}
