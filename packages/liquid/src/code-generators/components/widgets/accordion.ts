import { blockToLiquid } from '../../functions/block-to-liquid';
import { component } from '../../constants/components';
import { style } from '../../functions/style';

// TODO: slickStyles, emulate the div wrapping layers by the slick lib etc
export const Accordion = component({
  name: 'Builder:Accordion',
  component: (block, renderOptions) => {
    const { options } = block.component!;
    const { items } = options;

    return `
    <div class="builder-accordion" style="${style({
      display: 'flex',
      alignItems: 'stretch',
      flexDirection: 'column',
      ...(options.grid && {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }),
    })}">
      ${
        items
          ? items
              .map(
                (item: any, index: number) => `
                  <div
                    class="builder-accordion-title builder-accordion-title-closed"
                    style="${style({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      ...(options.grid && {
                        width: options.gridRowWidth,
                      }),
                    })}">
                    ${item.title
                      .map((child: any) => blockToLiquid(child, renderOptions))
                      .join('\n')}
                  </div>`
              )
              .join('\n')
          : ''
      }
    </div>
  `;
  },
});
