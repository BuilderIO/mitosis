import { BuilderElement } from '@builder.io/sdk';
import { blockToLiquid } from '../functions/block-to-liquid';
import { style } from '../functions/style';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';

export const Columns = component({
  name: 'Columns',
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;
    const columns: any[] = options.columns || [];
    const gutterSize: number = options.space || 20;

    function getWidth(index: number) {
      return (columns[index] && columns[index].width) || 100 / columns.length;
    }

    function getColumnWidth(index: number) {
      const subtractWidth = (gutterSize * (columns.length - 1)) / columns.length;
      return `calc(${getWidth(index)}% - ${subtractWidth}px)`;
    }

    return `
    <style>
      .builder-columns {
        display: flex;
      }

      .builder-blocks {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      .builder-column > .builder-blocks {
        flex-grow: 1;
      }
      ${columns
        .map(
          (col, index) => `
      .${block.id} > .builder-columns > .builder-column:nth-child(${index + 1}) {
        width: ${getColumnWidth(index)};
        margin-left: ${index === 0 ? 0 : gutterSize}px;
      }`
        )
        .join('\n')}
      </style>
      <div class="builder-columns">
        ${columns
          .map((col, index) => {
            const TagName = col.link ? 'a' : 'div';
            return `<${TagName}
            class="builder-column"
            style="${style({
              lineHeight: 'normal',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            })}"
            ${col.link ? `href="${col.link}"` : ''}>
            <div
              class="builder-blocks"
              builder-type="blocks">
              ${col.blocks.map((block: any) => blockToLiquid(block, renderOptions)).join('\n')}
            </div>
          </${TagName}>`;
          })
          .join('\n')}
        ${
          options.stackColumnsAt === 'never'
            ? ''
            : `
          <style>
        @media (max-width: ${options.stackColumnsAt !== 'tablet' ? 639 : 999}px) {
          .${block.id} > .builder-columns {
            flex-direction: ${options.reverseColumnsWhenStacked ? 'column-reverse' : 'column'};
            align-items: stretch;
          }

          .${block.id} > .builder-columns > .builder-column:nth-child(n) {
            width: 100%;
            margin-left: 0;
          }
        }
          </style>
        `
        }
      </div>
  `;
  },
});
