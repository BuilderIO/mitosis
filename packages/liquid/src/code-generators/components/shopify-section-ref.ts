import { BuilderElement } from '@builder.io/sdk';
import { component } from '../constants/components';
import { Options } from '../interfaces/options';

export const ShopifySectionRef = component({
  name: 'Shopify:SectionRef',
  component: (block: BuilderElement, renderOptions: Options) => {
    if (renderOptions.static) {
      return '';
    }
    const { options } = block.component!;
    const sectionName = options.section.split('/')[1]?.split('.')[0];

    return `
      <div
        builder-shopify-section="${block.id}"
        class="builder-shopify-section">
        {% section '${sectionName || ''}' %}
      </div>
    `;
  },
});
