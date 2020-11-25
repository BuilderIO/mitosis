import traverse from 'traverse';
import { JSXLiteComponent } from '../types/jsx-lite-component';

const propsRegex = /props\s*\.\s*([a-zA-Z0-9_\$]+)/;
const allPropsMatchesRegex = new RegExp(propsRegex, 'g');

/**
 * Get props used in the components by reference
 */
export const getProps = (json: JSXLiteComponent) => {
  const props = new Set<string>();
  traverse(json).forEach(function(item) {
    if (typeof item === 'string') {
      // TODO: proper babel ref matching
      const matches = item.match(allPropsMatchesRegex);
      if (matches) {
        for (const match of matches) {
          props.add(match.match(propsRegex)![1]);
        }
      }
    }
  });

  return props;
};
