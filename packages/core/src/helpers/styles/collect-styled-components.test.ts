import { componentToReact } from '@/generators/react';
import { collectStyledComponents } from './collect-styled-components';

describe('Styled Styles', () => {
  const mitosisJson = {
    '@type': '@builder.io/mitosis/component',
    imports: [],
    exports: {},
    meta: { useMetadata: {} },
    refs: {},
    state: {},
    children: [
      {
        '@type': '@builder.io/mitosis/node',
        name: 'div',
        meta: {},
        scope: {},
        properties: {},
        bindings: {
          css: {
            code: "{color:'#FFF',textAlign:'right',position:'relative',maxWidth:'537px','@media (max-width: 991px)':{maxWidth:'100%',margin:'40px 10px 0 0'},margin:'1022px 47px 0 0',font:'300 16px/25px Barlow, -apple-system, Roboto, Helvetica, sans-serif '}",
          },
        },
        children: [
          {
            '@type': '@builder.io/mitosis/node',
            name: 'div',
            meta: {},
            scope: {},
            properties: {
              _text:
                "Makeup artist Rosie Johnson's spirit is tightly intertwined with the world of art, fashion and beauty. She specialises in providing hair and makeup services on the Gold Coast, keeping track of all the latest trends and new directions in the industry. She uses professional and high level industry standard techniques to enhance your best features.\r<br/>\r<br/>Hair styling options are flexible to suit your event, preferences and hair, from classic sleek up styles to voluminous curls, or braided boho looks.<br/>\r<br/>Her and the Makeup Palace teams priority is to ensure you feel amazing and take your ideas, individual face shape, skin and hair, to create a look that you love. Based on the Gold Coast, her formal hair and makeup services have inspired confidence and beauty on wedding days, special occasions and more.",
            },
            bindings: {},
            children: [],
          },
        ],
      },
    ],
    context: { get: {}, set: {} },
    subComponents: [],
    name: 'MyBasicNestedComponent',
    hooks: { onMount: [], onEvent: [] },
  };

  test('Styled class is generated properly', () => {
    expect({ output: collectStyledComponents(mitosisJson as any) }).toMatchSnapshot();
  });

  test('Generated React code should not throw exception', () => {
    expect(() => {
      componentToReact({ stylesType: 'styled-components', plugins: [] })({
        component: mitosisJson as any,
      });
    }).not.toThrowError();
  });
});
