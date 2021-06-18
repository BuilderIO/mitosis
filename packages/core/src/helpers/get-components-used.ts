import { JSXLiteComponent } from 'src/types/jsx-lite-component';
import traverse from 'traverse';
import { isJsxLiteNode } from './is-jsx-lite-node';

export function getComponentsUsed(json: JSXLiteComponent) {
  const components = new Set<string>();

  traverse(json).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      components.add(item.name);
    }
  });

  return components;
}
