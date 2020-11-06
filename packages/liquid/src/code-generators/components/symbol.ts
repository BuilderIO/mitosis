import { component } from '../constants/components';
import { contentToLiquid } from '../functions/content-to-liquid';
import { serializeLiquidArgs } from '../functions/serialize-liquid-args';

export const Symbol = component({
  name: 'Symbol',
  component: (block, renderOptions) => {
    if (renderOptions.static) {
      return '';
    }

    const {
      options: {
        symbol: { inline, content, entry, data, dynamic, model },
      },
    } = block.component!;

    // TODO: generate render arguments and ensure state. arguments
    // remove the state. (or use state_ or something) in symbol generated
    // code
    const innerContent = content ? contentToLiquid(content, 'symbol', renderOptions).html : '';

    return `
    <div class="builder-symbol${inline ? ' builder-inline-symbol' : ''}">
      ${
        (dynamic || !entry) && model
          ? `
            <div builder-static-symbol="${block.id}">
              {% include 'model.${model}.builder.liquid', ${serializeLiquidArgs(data)} %}
            <div>
            `
          : inline || !entry
          ? innerContent
          : `
      {% capture snippet_content %}
        {% include 'content.${entry}.builder.liquid', ${serializeLiquidArgs(data)} %}
      {% endcapture %}
      {% if snippet_content contains "Liquid error" %}
        ${innerContent}
      {% else %}
        {{ snippet_content }}
      {% endif %}      
      `
      }
    </div>
    `;
  },
});
