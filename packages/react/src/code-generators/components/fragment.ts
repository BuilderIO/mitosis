import { BuilderElement } from '@builder.io/sdk';
import { component } from '../constants/components';

export const Fragment = component({
  name: 'Core:Fragment',
  noWrap: true,
  component: (block, options, context) => {
    return block.children
      ? block.children.map(child => blockToJsx(child, options, context)).join('\n')
      : '';
  },
});

import { blockToJsx } from '../../builder-to-jsx';
