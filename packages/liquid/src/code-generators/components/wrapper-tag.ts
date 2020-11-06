import { BuilderElement } from '@builder.io/sdk';
import { component } from '../constants/components';
import { blockToLiquid } from '../functions/block-to-liquid';
import { Options } from '../interfaces/options';
// import fails test
const dedent = require('dedent');

interface ConditionalTag extends Omit<BuilderElement, 'children'> {
  meta: { renderIf: string };
}

// TODO: should be in blockToLiquid, need update snaps for everything
const removeEmptyLines = (str: string) => {
  return str.replace(/^\s*\n/gm, '');
};

/**
 * WrapperTag components represents a set of tags that wraps its children
 * based on conditions in its meta.renderIf
 */
export const WrapperTag = component({
  name: 'Shopify:WrapperTag',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    const tags: ConditionalTag[] = block.component!.options.conditionalTags;
    let result = block.children
      ? block.children.map(child => blockToLiquid(child, renderOptions)).join('')
      : '';

    tags.forEach(tagElement => {
      const openingTag = blockToLiquid(tagElement, { ...renderOptions, openingTagOnly: true });
      result = [
        tagElement.meta.renderIf.replace('}true{', `}${openingTag}{`),
        result,
        tagElement.meta.renderIf.replace('}true{', `}</${tagElement.tagName}>{`),
      ].join('');
    });

    return removeEmptyLines(dedent(result));
  },
});
