import { component } from '../../constants/components';
import { blockToLiquid } from '../../functions/block-to-liquid';

export const FormInput = component({
  name: 'Form:Form',
  noWrap: true,
  component: (block, renderOptions, attributes) => {
    const { options } = block.component!;

    return `
      <form
        validate="${options.validate || ''}"
        action="${options.action || ''}"
        method="${options.method || ''}"
        name="${options.name}"
        ${attributes || ''}>
        ${
          (block.children &&
            block.children.map(child => blockToLiquid(child, renderOptions)).join('\n')) ||
          ''
        }
      </form>
    `;
  },
});
