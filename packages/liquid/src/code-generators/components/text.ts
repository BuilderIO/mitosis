import { BuilderElement } from '@builder.io/sdk';
import { component } from '../constants/components';

export const Text = component({
  name: 'Text',
  component: (block: BuilderElement) => {
    const { options } = block.component!;

    return `
      <style>
        .builder-text p:first-of-type, .builder-paragraph:first-of-type { margin: 0 } .builder-text > p, .builder-paragraph { color: inherit; line-height: inherit; letter-spacing: inherit; font-weight: inherit; font-size: inherit; text-align: inherit; font-family: inherit; }
      </style>
      <span class="builder-text">
        ${options.text || ''}
      </span>
    `;
  },
});
