import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';
import { UnlessBlockProps } from '../interfaces/component-props';
import { blockToLiquid, getLiquidConditionExpresion } from '../functions/block-to-liquid';

// Note: this implementation of unless does not support
// elsif tags, which apparently is allowed in shopify liquid.
// We might need to update this logic to be more like the
// Shopify:Condition logic in the future if we run into issues
export const Condition = component({
  name: 'Shopify:Unless',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    if (renderOptions.static) {
      return '';
    }
    const options = block.component!.options as UnlessBlockProps;
    let str = '';

    if (options.unlessBlocks) {
      const expression = options.expression && getLiquidConditionExpresion(options.expression);
      str += `{% unless ${expression} %}`;
      str += options.unlessBlocks.map(item => blockToLiquid(item, renderOptions)).join('\n');

      if (options.elseBlocks) {
        str += `{% else %}`;
        str += options.elseBlocks.map(item => blockToLiquid(item, renderOptions)).join('\n');
      }

      str += '{% endunless %}';
    }

    return str;
  },
});
