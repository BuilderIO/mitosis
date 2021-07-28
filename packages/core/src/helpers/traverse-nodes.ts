import { JSXLiteComponent } from '../types/mitosis-component';
import { JSXLiteNode } from '../types/mitosis-node';
import traverse, { TraverseContext } from 'traverse';
import { isJsxLiteNode } from './is-mitosis-node';

export function tarverseNodes(
  component: JSXLiteComponent | JSXLiteNode,
  cb: (node: JSXLiteNode, context: TraverseContext) => void,
) {
  traverse(component).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      cb(item, this);
    }
  });
}
