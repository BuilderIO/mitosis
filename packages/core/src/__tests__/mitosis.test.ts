import { componentToMitosis } from '@/generators/mitosis';
import { MitosisComponent } from '@/types/mitosis-component';
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

describe('Mitosis close tag ID comments', () => {
  const testComponent: MitosisComponent = {
    '@type': '@builder.io/mitosis/component',
    name: 'DebugIds',
    imports: [],
    meta: {},
    state: {},
    context: { get: {}, set: {} },
    refs: {},
    hooks: {
      onMount: [],
      onUnMount: { code: '' },
      onEvent: [],
      init: { code: '' },
      onInit: { code: '' },
      preComponent: { code: '' },
      postComponent: { code: '' },
      onUpdate: [],
    },
    inputs: [],
    subComponents: [],
    children: [
      {
        '@type': '@builder.io/mitosis/node',
        name: 'div',
        meta: {},
        properties: { _id: 'root' },
        scope: {},
        bindings: {},
        children: [
          {
            '@type': '@builder.io/mitosis/node',
            name: 'div',
            meta: {},
            properties: { _id: 'child1' },
            scope: {},
            bindings: {},
            children: [
              {
                '@type': '@builder.io/mitosis/node',
                name: 'span',
                meta: {},
                properties: { _text: 'Hello' },
                scope: {},
                bindings: {},
                children: [],
              },
            ],
          },
          {
            '@type': '@builder.io/mitosis/node',
            name: 'div',
            meta: {},
            properties: { _id: 'child2' },
            scope: {},
            bindings: {},
            children: [
              {
                '@type': '@builder.io/mitosis/node',
                name: 'span',
                meta: {},
                properties: { _id: 'grandchild', _text: 'World' },
                scope: {},
                bindings: {},
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  test('adds close tag ID comments when addCloseTagIdComments is true', () => {
    const output = componentToMitosis({ addCloseTagIdComments: true })({
      component: testComponent,
    });
    expect(output).toMatchInlineSnapshot(`
      "export default function DebugIds(props) {
        return (
          <>
            <div _id=\\"root\\">
              <div _id=\\"child1\\">Hello</div>
              {/* end child1 */}
              <div _id=\\"child2\\">World</div>
              {/* end child2 */}
            </div>
            {/* end root */}
          </>
        );
      }
      "
    `);
  });

  test('does not add close tag ID comments when addCloseTagIdComments is false', () => {
    const output = componentToMitosis({ addCloseTagIdComments: false })({
      component: testComponent,
    });
    expect(output).toMatchInlineSnapshot(`
      "export default function DebugIds(props) {
        return (
          <div _id=\\"root\\">
            <div _id=\\"child1\\">Hello</div>
            <div _id=\\"child2\\">World</div>
          </div>
        );
      }
      "
    `);
  });
});
