import traverse from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';

export const hasProps = (json: MitosisComponent) => {
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
