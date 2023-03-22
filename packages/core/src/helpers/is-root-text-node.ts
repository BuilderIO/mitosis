import { MitosisNode } from '../types/mitosis-node';
import { MitosisComponent } from '../types/mitosis-component';

export function isRootTextNode(json: MitosisComponent) {
  const firstChild = json.children[0];
  return Boolean(firstChild && isTextNode(firstChild));
}

export function isTextNode(node: MitosisNode) {
  return Boolean(node.properties._text || node.bindings._text);
}
