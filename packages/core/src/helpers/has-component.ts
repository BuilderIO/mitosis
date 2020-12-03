import traverse from 'traverse';
import { JSXLiteComponent } from '../types/jsx-lite-component';
import { isJsxLiteNode } from './is-jsx-lite-node';

export const hasComponent = (name: string, json: JSXLiteComponent) => {
  let has = false;
  traverse(json).forEach(function (item) {
    if (isJsxLiteNode(item)) {
      if (item.name === name) {
        has = true;
        this.stop();
      }
    }
  });
  return has;
};
