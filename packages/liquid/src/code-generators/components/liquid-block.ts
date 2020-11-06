import { BuilderElement } from '@builder.io/sdk';
import { component } from '../constants/components';
import { Options } from '../interfaces/options';
import { serializeLiquidArgs } from '../functions/serialize-liquid-args';

export const LiquidBlock = component({
  name: 'Shopify:LiquidBlock',
  component: (block: BuilderElement, renderOptions: Options) => {
    if (renderOptions.static) {
      return '';
    }
    const { options } = block.component!;
    const blockName = options.templatePath.split('/')[1].replace(/\.liquid$/g, '');
    const args = serializeLiquidArgs(options.options);

    return `
      <div 
        builder-liquid-block="${block.id}"
        class="builder-liquid-block">
        {% include '${blockName}' ${args.length > 0 ? `, ${args}` : ''}%}
      </div>
    `;
  },
});
