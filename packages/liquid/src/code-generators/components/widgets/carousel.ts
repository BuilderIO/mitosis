import { blockToLiquid } from '../../functions/block-to-liquid';
import { component } from '../../constants/components';

// TODO: slickStyles, emulate the div wrapping layers by the slick lib etc
export const Carousel = component({
  name: 'Builder:Carousel',
  component: (block, renderOptions) => {
    return `
    <div class="builder-carousel">
      ${
        block.children
          ? // TODO: limit repeat on first element to just one hm
            block.children
              .slice(0, 1)
              .map(child => blockToLiquid(child, renderOptions))
              .join('\n')
          : ''
      }
    </div>
  `;
  },
});
