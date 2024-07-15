import traverse from 'neotraverse';
import { isMitosisNode } from '../../../helpers/is-mitosis-node';
import { MitosisComponent } from '../../../types/mitosis-component';

/**
 * Find event handlers that explicitly call .preventDefault() and
 * add preventdefault:event
 * https://qwik.builder.io/tutorial/events/preventdefault
 */
export function addPreventDefault(json: MitosisComponent) {
  traverse(json).forEach((node) => {
    if (isMitosisNode(node)) {
      if (node.bindings) {
        for (const key of Object.keys(node.bindings)) {
          if (key.startsWith('on')) {
            if (node.bindings[key]?.code.includes('.preventDefault()')) {
              const event = key.slice(2).toLowerCase();
              node.properties['preventdefault:' + event] = '';
              node.bindings[key]!.code = node.bindings[key]!.code.replace(
                /.*?\.preventDefault\(\);?/,
                '',
              ).trim();
            }
          }
        }
      }
    }
  });
}
