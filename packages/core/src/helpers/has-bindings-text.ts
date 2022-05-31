import traverse from 'traverse';
import { MitosisComponent } from '../types/mitosis-component';
import { isMitosisNode } from './is-mitosis-node';
import isChildren from './is-children';

export const hasBindingsText = (json: MitosisComponent) => {
  let has = false;
  traverse(json).forEach(function (node) {
    if (isMitosisNode(node) && !isChildren(node) && node.bindings._text?.code) {
      has = true;
      this.stop();
    }
  });
  return has;
};
