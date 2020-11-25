import traverse from 'traverse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { isJsxLiteNode } from './is-jsx-lite-node';

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
