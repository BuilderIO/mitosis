import traverse from 'neotraverse';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';

export const hasStatefulDom = (json: MitosisComponent) => {
  let has = false;
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      if (/input|textarea|select/.test(item.name)) {
        has = true;
        this.stop();
      }
    }
  });
  return has;
};
