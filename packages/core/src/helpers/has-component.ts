import traverse from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';

export const hasComponent = (name: string, json: MitosisComponent) => {
  let has = false;
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      if (item.name === name) {
        has = true;
        this.stop();
      }
    }
  });
  return has;
};
