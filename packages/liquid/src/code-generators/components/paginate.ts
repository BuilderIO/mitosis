import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';
import { blockToLiquid } from '../functions/block-to-liquid';

export const Paginate = component({
  name: 'Shopify:Paginate',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;
    const { expression, limit } = options;

    if (renderOptions.static) {
      return '';
    }

    return `{% paginate ${expression}${limit ? ' by ' + limit : ''} %} 
      ${block.children?.map(child => blockToLiquid(child, renderOptions)).join('\n') || ''} 
      {% endpaginate %}`;
  },
});
