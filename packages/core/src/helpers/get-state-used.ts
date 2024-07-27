import traverse from 'neotraverse/legacy';
import { MitosisComponent } from '../types/mitosis-component';

const stateAccessRegex = /state\s*\.\s*([a-zA-Z0-9_\$]+)/;
const allStateMatchesRegex = new RegExp(stateAccessRegex, 'g');

/**
 * Get state used in the components by reference
 */
export const getStateUsed = (json: MitosisComponent) => {
  const stateProperties = new Set<string>();
  traverse(json).forEach(function (item) {
    if (typeof item === 'string') {
      // TODO: proper babel ref matching
      const matches = item.match(allStateMatchesRegex);
      if (matches) {
        for (const match of matches) {
          stateProperties.add(match.match(stateAccessRegex)![1]);
        }
      }
    }
  });

  return stateProperties;
};
