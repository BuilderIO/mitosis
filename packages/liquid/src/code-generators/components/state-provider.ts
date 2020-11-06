import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { blockToLiquid } from '../functions/block-to-liquid';
import { component } from '../constants/components';

export const StateProvider = component({
  name: 'Builder:StateProvider',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    return block.children
      ? block.children.map(child => blockToLiquid(child, renderOptions)).join('\n')
      : '';
  },
});
