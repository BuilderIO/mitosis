import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { blockToLiquid } from '../functions/block-to-liquid';
import { component } from '../constants/components';

export const StaticContent = component({
  name: 'Shopify:StaticContent',
  component: (block: BuilderElement, renderOptions: Options) => {
    return `
    <div class="builder-static-content" data-builder-static-id="${block.id}">
      ${
        block.children
          ? block.children.map(child => blockToLiquid(child, renderOptions)).join('\n')
          : ''
      }
    </div>
  `;
  },
});
