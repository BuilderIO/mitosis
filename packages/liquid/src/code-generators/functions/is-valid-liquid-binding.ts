import { Options } from '../interfaces/options';

/**
 * Test if the binding expression would be likely to generate
 * valid or invalid liquid. If we generate invalid liquid tags
 * Shopify will reject our PUT to update the template
 */
export const isValidLiquidBinding = (str = '', options: Options) => {
  const strictMatches = Boolean(
    // Test for our `context.shopify.liquid.*(expression), which
    // we regex out later to transform back into valid liquid expressions
    str.match(/(context|ctx)\s*(\.shopify\s*)?\.liquid\s*\./)
  );

  if (!options.looseBindings) {
    return strictMatches;
  }

  return (
    strictMatches ||
    // Test is the expression is simple and would map to Shopify bindings	    // Test for our `context.shopify.liquid.*(expression), which
    // e.g. `state.product.price` -> `{{product.price}}	    // we regex out later to transform back into valid liquid expressions
    Boolean(str.match(/^[a-z0-9_\.\s]+$/i))
  );
};
