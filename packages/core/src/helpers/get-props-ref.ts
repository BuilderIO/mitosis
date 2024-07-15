import traverse from 'neotraverse';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';

export function getPropsRef(json: MitosisComponent, shouldRemove?: boolean): [string, boolean] {
  let has = false;
  let prop = '';
  traverse(json).forEach(function (item) {
    if (isMitosisNode(item)) {
      const binding = item.bindings.ref;
      const regexp = /(.+)?props\.(.+)( |\)|;|\()?$/;
      if (binding && regexp.test(binding.code)) {
        const match = regexp.exec(binding.code);
        const _prop = match?.[2];
        if (_prop) {
          prop = _prop;
        }
        if (shouldRemove) {
          delete item.bindings.ref;
        }
        has = true;
        this.stop();
      }
    }
  });
  return [prop, has];
}
