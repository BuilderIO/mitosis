import { componentToMitosis } from '@/generators/mitosis';
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
            properties: { _text: '<>' },
          }),
        ],
        hooks: {},
      }),
    });

    expect(result).toMatchSnapshot();
  });
});
