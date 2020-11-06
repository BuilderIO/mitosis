import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';

export const Capture = component({
  name: 'Shopify:Capture',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;
    const { expression, variableName } = options;
    if (renderOptions.static) {
      return '';
    }

    return `{% capture ${variableName} %}${expression}{% endcapture %}`;
  },
});
