import { component } from '../constants/components';
import { style } from '../functions/style';

export const Button = component({
  name: 'Core:Button',
  noWrap: true,
  component: (block, jsxOptions) => {
    const { options } = block.component!;
    const tag = options.link ? 'a' : 'span';

    return `
      <${tag}${options.openLinkInNewTab ? ' target="_blank"' : ''}${
      options.link ? ` href="${options.link}"` : ''
    } ${style((block.responsiveStyles?.large as any) || {}, jsxOptions)}>
        ${options.text || ''}
      </${tag}>
    `;
  },
});
