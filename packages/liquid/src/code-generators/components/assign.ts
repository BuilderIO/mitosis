import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';

export const Assign = component({
  name: 'Shopify:Assign',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;
    const content = options.expression;
    if (renderOptions.static) {
      return '';
    }

    return `{% assign ${content} %}`;
  },
});
