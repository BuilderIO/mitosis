import traverse from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import { isMitosisNode } from './is-mitosis-node';

/**
 * Test if the component has something
 *
 * e.g.
 *    const hasSpread = has(component, node => some(node.bindings, { type: 'spread' }));
 */
export function has(json: MitosisComponent, test: (node: MitosisNode) => boolean) {
  let found = false;
  traverse(json).forEach(function (thing) {
    if (isMitosisNode(thing)) {
      if (test(thing)) {
        found = true;
        this.stop();
      }
    }
  });
  return found;
}
