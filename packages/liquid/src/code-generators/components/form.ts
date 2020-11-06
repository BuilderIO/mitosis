import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';
import { blockToLiquid } from '../functions/block-to-liquid';

export const Form = component({
  name: 'Shopify:Form',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    if (renderOptions.static) {
      return '';
    }
    const { options } = block.component!;
    const { type, parameter, customAttributes } = options;
    let formScriptTag;

    // This script tag allows us to get the Shopify form object for each form.
    // https://shopify.dev/docs/themes/liquid/reference/objects/form
    if (block.id) {
      formScriptTag = `
        <script type="text/javascript">
          (function() {
            try {
              var formData = {{form | json}};

              if (formData) {
                window.BuilderShopifyData = window.BuilderShopifyData || {};
                window.BuilderShopifyData['${block.id}'] = window.BuilderShopifyData['${block.id}'] || {};
                window.BuilderShopifyData['${block.id}'].form = formData;
              }
            } catch (e) {
              console.error('Error rendering json form data: ', e);
            }
          })()
        </script>`
        .trim()
        .replace(/\s+/, ' ');
    }

    const parameterString = (parameter && `, ${parameter}`) || '';
    const customAttributesString =
      (customAttributes?.length && `, ${customAttributes.join(', ')}`) || '';

    return `{% form '${type}'${parameterString}${customAttributesString} %}
      ${formScriptTag || ''}
      ${block.children?.map(child => blockToLiquid(child, renderOptions)).join('\n') || ''} 
      {% endform %}`;
  },
});
