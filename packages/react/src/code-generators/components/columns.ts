import { BuilderElement } from '@builder.io/sdk';
import { style } from '../functions/style';
import { component } from '../constants/components';

export const Columns = component({
  name: 'Columns',
  component: (block, jsxOptions, context) => {
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
    
      <div className="builder-columns" ${
        options.format === 'solid'
          ? ''
          : style(
              {
                display: 'flex',
                '& .builder-blocks': {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                },
                '& .builder-column > .builder-blocks': {
                  flexGrow: '1',
                },
                ...columns.reduce((memo, val, index) => {
                  memo[`& > div.builder-column:nth-of-type(${index + 1})`] = {
                    width: getColumnWidth(index),
                    marginLeft: `${index === 0 ? 0 : gutterSize}px`,
                  };
                  return memo;
                }, {}),
                ...(options.stackColumnsAt === 'never'
                  ? {}
                  : {
                      [`@media (max-width: ${
                        options.stackColumnsAt !== 'tablet' ? 639 : 999
                      }px)`]: {
                        flexDirection: options.reverseColumnsWhenStacked
                          ? 'column-reverse'
                          : 'column',
                        alignItems: 'stretch',
                        '& > div.builder-column:nth-of-type(n)': {
                          width: '100%',
                          marginLeft: '0',
                        },
                      },
                    }),
              },
              jsxOptions
            )
      }>
      ${
        jsxOptions.format === 'react'
          ? ''
          : `<style>{\`
        .${block.id} .builder-columns {
          display: flex;
        }

        .${block.id} .builder-blocks {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        .${block.id} .builder-column > .builder-blocks {
          flex-grow: 1;
        }
        ${columns
          .map(
            (col, index) => `
        .${block.id} > .builder-columns > div.builder-column:nth-of-type(${
              index + 1 /* bc of style tag - remove */
            }) {
          width: ${getColumnWidth(index)};
          margin-left: ${index === 0 ? 0 : gutterSize}px;
        }`
          )
          .join('\n')}

          ${
            options.stackColumnsAt === 'never'
              ? ''
              : `
          @media (max-width: ${options.stackColumnsAt !== 'tablet' ? 639 : 999}px) {
            .${block.id} > .builder-columns {
              flex-direction: ${options.reverseColumnsWhenStacked ? 'column-reverse' : 'column'};
              align-items: stretch;
            }
  
            .${block.id} > .builder-columns > div.builder-column:nth-of-type(n) {
              width: 100%;
              margin-left: 0;
            }
          }
          `
          }
      \`}</style>`
      }
        ${columns
          .map((col, index) => {
            const TagName = col.link ? 'a' : 'div';
            return `<${TagName}
            className="builder-column"
            ${style(
              {
                lineHeight: 'normal',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              },
              jsxOptions
            )}
            ${col.link ? `href="${col.link}"` : ''}>
            <div
              className="builder-blocks"
              builder-type="blocks">
              ${col.blocks.map((block: any) => blockToJsx(block, jsxOptions, context)).join('\n')}
            </div>
          </${TagName}>`;
          })
          .join('\n')}
       
      </div>
  `;
  },
});

import { blockToJsx } from '../../builder-to-jsx';
