import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { blockToLiquid } from '../functions/block-to-liquid';
import { component } from '../constants/components';

const postProcessThemeLiquid = (liquid: string) => {
  return liquid.replace(/([^a-z_\.])settings\s*\.\s*/gi, `$1_theme_settings.`);
};
export const ThemeProvider = component({
  name: 'Shopify:ThemeProvider',
  noWrap: true,
  component: (block: BuilderElement, renderOptions: Options) => {
    const liquid = `
      ${
        block.children
          ? block.children.map(child => blockToLiquid(child, renderOptions)).join('\n')
          : ''
      }
  `;
    return postProcessThemeLiquid(liquid);
  },
});
