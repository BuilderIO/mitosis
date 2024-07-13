import traverse, { TraverseContext } from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';
import { isMitosisNode } from './is-mitosis-node';

export function traverseNodes(
  component: MitosisComponent | MitosisNode,
  cb: (node: MitosisNode, context: TraverseContext) => void,
) {
  traverse(component).forEach(function (item) {
    if (isMitosisNode(item)) {
      cb(item, this);
    }
  });
}
