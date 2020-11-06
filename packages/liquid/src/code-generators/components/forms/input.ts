import { component } from '../../constants/components';

export const FormInput = component({
  name: 'Form:Input',
  noWrap: true,
  component: (block, _, attributes) => {
    const { options } = block.component!;

    return `
      <input
        placeholder="${options.placeholder || ''}"
        name="${options.name || ''}"
        type="${options.type || ''}"
        value="${options.value || options.defaultValue || ''}"
        ${attributes || ''} />
    `;
  },
});
