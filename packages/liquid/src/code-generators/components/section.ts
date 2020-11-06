import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { style } from '../functions/style';
import { blockToLiquid } from '../functions/block-to-liquid';
import { component } from '../constants/components';

export const Section = component({
  name: 'Core:Section',
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;

    return `
    <div style="${style({
      height: '100%',
      width: '100%',
      alignSelf: 'stretch',
      flexGrow: '1',
      boxSizing: 'border-box',
      maxWidth: options.maxWidth ? options.maxWidth + 'px' : undefined,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      marginLeft: 'auto',
      marginRight: 'auto',
    })}">
      ${
        block.children
          ? block.children.map(child => blockToLiquid(child, renderOptions)).join('\n')
          : ''
      }
    </div>
  `;
  },
});
