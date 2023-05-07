import { MitosisComponent } from '../../types/mitosis-component';
import { MitosisNode } from '../../types/mitosis-node';
import { stripStateAndPropsRefs } from '../../helpers/strip-state-and-props-refs';

import { ToReactOptions } from './types';

export const processBinding = (str: string, options: Pick<ToReactOptions, 'stateType'>) => {
  if (options.stateType !== 'useState') {
    return str;
  }

  return stripStateAndPropsRefs(str, {
    includeState: true,
    includeProps: false,
  });
};

export const openFrag = () => getFragment('open');
export const closeFrag = () => getFragment('close');
export function getFragment(type: 'open' | 'close') {
  return type === 'open' ? `<>` : `</>`;
}
export const wrapInFragment = (json: MitosisComponent | MitosisNode) => json.children.length !== 1;

/**
 * If the root Mitosis component only has 1 child, and it is a `Show`/`For` node, then we need to wrap it in a fragment.
 * Otherwise, we end up with invalid React render code.
 */
export const isRootSpecialNode = (json: MitosisComponent) =>
  json.children.length === 1 && ['Show', 'For'].includes(json.children[0].name);
