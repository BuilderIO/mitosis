import traverse from 'neotraverse';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';

export const stripMetaProperties = (json: MitosisComponent) => {
  traverse(json).forEach((item) => {
    if (isMitosisNode(item)) {
      for (const property in item.properties) {
        if (property.startsWith('$')) {
          delete item.properties[property];
        }
      }
      for (const property in item.bindings) {
        if (property.startsWith('$')) {
          delete item.bindings[property];
        }
      }
    }
  });

  return json;
};
