import oneComp from './one-component';
import showForComp from './show-for-component';
import SignalParent from './signals/parent.lite';
import specialTags from './special-tags.lite';
import twoComp from './two-components';
import typedComp from './types';

export const COMPONENT_MAP = {
  '/one-component/': oneComp,
  '/two-components/': twoComp,
  '/types/': typedComp,
  '/show-for-component/': showForComp,
  '/special-tags/': specialTags,
  '/signals': SignalParent,
};
