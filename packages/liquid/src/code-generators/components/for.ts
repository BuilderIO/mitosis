import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';
import { blockToLiquid } from '../functions/block-to-liquid';
import dedent from 'dedent';

export const For = component({
  name: 'Shopify:For',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;
    const { repeat } = options;

    if (renderOptions.static) {
      return '';
    }

    return dedent`${repeat.expression} ${
      block.children?.map(child => blockToLiquid(child, renderOptions)).join('\n') || ''
    } {% endfor %}`;
  },
});
