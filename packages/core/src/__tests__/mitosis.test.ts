import { componentToMitosis } from '@/generators/mitosis';
import { createSingleBinding } from '@/helpers/bindings';
import { createMitosisComponent } from '@/helpers/create-mitosis-component';
import { createMitosisNode } from '@/helpers/create-mitosis-node';
import { runTestsForTarget } from './test-generator';

describe('Mitosis, format: legacy', () => {
  runTestsForTarget({
    options: { format: 'legacy' },
    target: 'mitosis',
    generator: componentToMitosis,
  });
});

describe('Mitosis, format: legacy (native loops and conditionals)', () => {
  runTestsForTarget({
    options: {
      format: 'legacy',
      nativeLoops: true,
      nativeConditionals: true,
      returnArray: true,
    },
    target: 'mitosis',
    generator: componentToMitosis,
  });
});

describe('Mitosis, format: react', () => {
  runTestsForTarget({
    options: {
      format: 'react',
    },
    target: 'mitosis',
    generator: componentToMitosis,
  });
});

describe('Can encode <> in text', () => {
  it('should encode <> in text', () => {
    const result = componentToMitosis()({
      component: createMitosisComponent({
        children: [
          createMitosisNode({
            properties: { _text: '<>{}' },
          }),
        ],
        hooks: {},
      }),
    });

    expect(result).toMatchSnapshot();
  });
  it('should not encode valid jsx', () => {
    const result = componentToMitosis()({
      component: createMitosisComponent({
        children: [
          createMitosisNode({
            properties: { _text: 'hello <b>world</b>' },
          }),
        ],
        hooks: {},
      }),
    });

    expect(result).toMatchSnapshot();
  });

  it('encode single > character', () => {
    const result = componentToMitosis()({
      component: createMitosisComponent({
        children: [
          createMitosisNode({
            properties: { _text: '>' },
          }),
        ],
        hooks: {},
      }),
    });

    expect(result).toMatchInlineSnapshot(`
      "export default function MyComponent(props) {
        return <>&amp;gt;</>;
      }
      "
    `);
  });

  it('should not output invalid jsx attributes', () => {
    const result = componentToMitosis()({
      component: createMitosisComponent({
        children: [
          createMitosisNode({
            properties: { ':click': 'onClick()', '@click': 'onClick()' },
            bindings: {
              ':key': createSingleBinding({ code: '1' }),
            },
          }),
        ],
        hooks: {},
      }),
    });

    expect(result).toMatchSnapshot();
  });
});
