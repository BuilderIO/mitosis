import { BuilderElement } from '@builder.io/sdk';
import { component } from '../constants/components';
import { style } from '../functions/style';

export const Text = component({
  name: 'Text',
  component: (block: BuilderElement, jsxOptions) => {
    const { options } = block.component!;

    // TODO: move to styled-components / jsx
    return `
    ${
      jsxOptions.format === 'solid'
        ? `<style>{\`
    .builder-text p:first-of-type, .builder-text  .builder-paragraph:first-of-type { margin: 0 } 
    .builder-text > p, .builder-text .builder-paragraph { color: inherit; line-height: inherit; letter-spacing: inherit; font-weight: inherit; font-size: inherit; text-align: inherit; font-family: inherit; }
    \`}
    </style>`
        : ''
    }
      <span ${
        jsxOptions.format === 'react'
          ? style(
              {
                '& p:first-of-type, & .builder-paragraph:first-of-type': {
                  margin: '0',
                },
                '& > p, & .builder-paragraph ': {
                  color: 'inherit',
                  lineHeight: 'inherit',
                  letterSpacing: 'inherit',
                  fontWeight: 'inherit',
                  fontSize: 'inherit',
                  textAlign: 'inherit',
                  fontFamily: 'inherit',
                },
              },
              jsxOptions
            )
          : ''
      } className="builder-text">
        ${options.text || ''}
      </span>
    `;
  },
});
