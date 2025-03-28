import traverse from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';

export const applyMetaTagName = (json: MitosisComponent) => {
  traverse(json).forEach((item) => {
    if (isMitosisNode(item)) {
      if (item.properties.$tagName) {
        item.name = item.properties.$tagName;
        delete item.properties.$tagName;
      }
    }
  });

  return json;
};
