import { component } from '../../constants/components';

export const SubmitButton = component({
  name: 'Form:SubmitButton',
  noWrap: true,
  component: (block, _, attributes) => {
    const { options } = block.component!;

    return `
      <button type="submit" ${attributes || ''}>${options.text || ''}</button>
    `;
  },
});
