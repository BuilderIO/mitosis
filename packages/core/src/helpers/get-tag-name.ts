import { MitosisNode } from '..';

/**
 * Returns the tag name of the component. Checks for Builder's `$tagName`
 * property first, then falls back to the component name.
 */
export const getBuilderTagName = (node: MitosisNode) => {
  return node.properties.$tagName;
};
