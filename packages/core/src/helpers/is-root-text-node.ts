import { MitosisComponent } from '../types/mitosis-component';
import { MitosisNode } from '../types/mitosis-node';

export function isRootTextNode(json: MitosisComponent | MitosisNode) {
  const firstChild = json.children[0];
  return Boolean(json.children.length === 1 && firstChild && isTextNode(firstChild));
}

export function isTextNode(node: MitosisNode) {
  return Boolean(node.properties._text || node.bindings._text);
}
