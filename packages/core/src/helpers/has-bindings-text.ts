import traverse from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';
import isChildren from './is-children';
import { isMitosisNode } from './is-mitosis-node';

export const hasBindingsText = (json: MitosisComponent) => {
  let has = false;
  traverse(json).forEach(function (node) {
    if (isMitosisNode(node) && !isChildren({ node }) && node.bindings._text?.code) {
      has = true;
      this.stop();
    }
  });
  return has;
};
