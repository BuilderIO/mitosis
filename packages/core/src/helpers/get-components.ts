import traverse from 'traverse';
import { JSXLiteComponent } from '../types/mitosis-component';
import { isJsxLiteNode } from './is-mitosis-node';
import { isUpperCase } from './is-upper-case';

export function getComponents(json: JSXLiteComponent): Set<string> {
  const components = new Set<string>();
  traverse(json).forEach(function(item) {
    if (isJsxLiteNode(item)) {
      if (isUpperCase(item.name[0])) {
        components.add(item.name);
      }
    }
  });

  return components;
}
