import { JSXLiteComponent } from '../types/mitosis-component';
import traverse from 'traverse';
import { isJsxLiteNode } from './is-mitosis-node';

export function getComponentsUsed(json: JSXLiteComponent) {
  const components = new Set<string>();

  traverse(json).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      components.add(item.name);
    }
  });

  return components;
}
