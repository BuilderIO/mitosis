import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';
import { ConditionBlockProps } from '../interfaces/component-props';
import { blockToLiquid, getLiquidConditionExpresion } from '../functions/block-to-liquid';

export const Condition = component({
  name: 'Shopify:Condition',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    if (renderOptions.static) {
      return '';
    }
    const options = block.component!.options as ConditionBlockProps;
    let str = '';
    for (let i = 0; i < options.branches.length; i++) {
      const branch = options.branches[i];
      const expression = branch.expression && getLiquidConditionExpresion(branch.expression);
      if (i === 0) {
        str += `{% if ${expression} %}`;
        str += branch.blocks
          .map((item: BuilderElement) => blockToLiquid(item, renderOptions))
          .join('\n');
      } else {
        if (expression) {
          str += `{% elsif ${expression} %}`;
        } else {
          str += '{% else %}';
        }
        str += branch.blocks
          .map((item: BuilderElement) => blockToLiquid(item, renderOptions))
          .join('\n');
      }
    }
    str += '{% endif %}';

    return str;
  },
});
