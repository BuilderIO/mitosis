import traverse from 'traverse';
import { JSXLiteComponent } from '../types/mitosis-component';
import { isJsxLiteNode } from './is-mitosis-node';

export const getRefs = (json: JSXLiteComponent) => {
  const refs = new Set<string>();
  traverse(json).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      if (typeof item.bindings.ref === 'string') {
        refs.add(item.bindings.ref);
      }
    }
  });

  return refs;
};
