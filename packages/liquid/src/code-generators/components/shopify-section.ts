import { BuilderElement } from '@builder.io/sdk';
import { component } from '../constants/components';
import { blockToLiquid } from '../functions/block-to-liquid';
import { Options } from '../interfaces/options';
import { snakeCase } from 'lodash';

const postProcessSection = (liquid: string, path: string) => {
  return liquid.replace(/([^a-z_\.])section\s*\.\s*/gi, `$1_section_${snakeCase(path)}.`);
};
export const ShopifySection = component({
  name: 'Shopify:Section',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    if (renderOptions.static) {
      return '';
    }
    const { options } = block.component!;

    // section class looks like: collection-template-section
    const sectionClass = options.schema?.class || '';
    let sectionId;
    if (sectionClass) {
      sectionId = `shopify-section-${sectionClass.split('-').slice(0, -1).join('-')}`;
    }

    const liquid = `
    <div
      ${sectionId ? 'id=' + sectionId : ''}
      class="shopify-section ${sectionClass}"
    >
      ${
        block.children
          ? block.children.map(child => blockToLiquid(child, renderOptions)).join('\n')
          : ''
      }
    </div>
  `;
    return postProcessSection(liquid, options.template);
  },
});
