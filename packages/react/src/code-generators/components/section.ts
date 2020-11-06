import { BuilderElement } from '@builder.io/sdk';
import { style } from '../functions/style';
import { component } from '../constants/components';

export const Section = component({
  name: 'Core:Section',
  component: (block, jsxOptions, context) => {
    const { options } = block.component!;

    return `
    <div ${style(
      {
        height: '100%',
        width: '100%',
        alignSelf: 'stretch',
        flexGrow: '1',
        boxSizing: 'border-box',
        maxWidth: options.maxWidth ? options.maxWidth + 'px' : '',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      jsxOptions
    )}>
      ${
        block.children
          ? block.children.map(child => blockToJsx(child, jsxOptions, context)).join('\n')
          : ''
      }
    </div>
  `;
  },
});

import { blockToJsx } from '../../builder-to-jsx';
import { mapToCss } from '../functions/map-to-css';
