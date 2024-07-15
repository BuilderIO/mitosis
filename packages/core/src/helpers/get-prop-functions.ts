import traverse from 'neotraverse';
import { MitosisComponent } from '../types/mitosis-component';

const propsRegex = /props\s*\.\s*([a-zA-Z0-9_\4]+)\(/;
const allPropsMatchesRegex = new RegExp(propsRegex, 'g');

/**
 * Get props used in the components by reference
 */
export const getPropFunctions = (json: MitosisComponent) => {
  const props: string[] = [];
  traverse(json).forEach(function (item) {
    if (typeof item === 'string') {
      // TODO: proper babel ref matching
      const matches = item.match(allPropsMatchesRegex);
      if (matches) {
        for (const match of matches) {
          props.push(match.match(propsRegex)![1]);
        }
      }
    }
  });

  return props;
};
