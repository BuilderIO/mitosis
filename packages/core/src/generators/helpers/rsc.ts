import { isMitosisNode } from '@/helpers/is-mitosis-node';
import type { MitosisComponent } from '@/types/mitosis-component';
import type { MitosisNode } from '@/types/mitosis-node';
import traverse from 'neotraverse/legacy';

const checkIsNodeAMitosisComponent = (node: MitosisNode) =>
  node.name[0] === node.name[0].toUpperCase();

export const checkIfIsClientComponent = (json: MitosisComponent) => {
  if (json.hooks.onMount.length) return true;
  if (json.hooks.onUnMount?.code) return true;
  if (json.hooks.onUpdate?.length) return true;
  if (Object.keys(json.refs).length) return true;
  if (Object.keys(json.context.set).length) return true;
  if (Object.keys(json.context.get).length) return true;
  if (Object.values(json.state).filter((s) => s?.type === 'property').length) return true;

  let foundEventListener = false;
  traverse(json).forEach(function (node) {
    if (isMitosisNode(node) && !checkIsNodeAMitosisComponent(node)) {
      if (Object.keys(node.bindings).filter((item) => item.startsWith('on')).length) {
        foundEventListener = true;
        this.stop();
      }
    }
  });

  return foundEventListener;
};
