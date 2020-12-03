import traverse from 'traverse';
import { JSXLiteComponent } from '../types/jsx-lite-component';

export const hasProps = (json: JSXLiteComponent) => {
  let has = false;
  traverse(json).forEach(function (item) {
    // TODO: use proper reference tracking
    if (typeof item === 'string' && item.match(/(^|\W)props\s*\./)) {
      has = true;
      this.stop();
    }
  });
  return has;
};
