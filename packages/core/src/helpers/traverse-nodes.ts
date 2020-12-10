import { JSXLiteComponent } from '../types/jsx-lite-component';
import { JSXLiteNode } from '../types/jsx-lite-node';
import traverse, { TraverseContext } from 'traverse';
import { isJsxLiteNode } from './is-jsx-lite-node';

export function tarverseNodes(
  component: JSXLiteComponent | JSXLiteNode,
  cb: (node: JSXLiteNode, context: TraverseContext) => void,
) {
  traverse(component).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      cb(item, this);
    }
  });
}
