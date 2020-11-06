import { component } from '../constants/components';

export const Button = component({
  name: 'Core:Button',
  noWrap: true,
  component: (block, renderOptions, attributes) => {
    const { options } = block.component!;
    const tag = options.link ? 'a' : 'span';

    return `
      <${tag}${options.openLinkInNewTab ? ' target="_blank"' : ''}${
      options.link ? ` href="${options.link}"` : ''
    } ${attributes || ''}>
        ${options.text || ''}
      </${tag}>
    `;
  },
});
