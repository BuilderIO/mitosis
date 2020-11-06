import { component } from '../../constants/components';
import { blockToLiquid } from '../../functions/block-to-liquid';

export const Label = component({
  name: 'Form:Label',
  noWrap: true,
  component: (block, renderOptions, attributes) => {
    const { options } = block.component!;

    return `
      <label
        for="${options.for || ''}"
        ${attributes || ''}>
        ${options.text ? `<span class="builder-label-text">${options.text}</span>` : ''}
        ${
          (block.children &&
            block.children.map(child => blockToLiquid(child, renderOptions)).join('\n')) ||
          ''
        }
      </label>
    `;
  },
});
