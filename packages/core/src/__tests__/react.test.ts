import { componentToReact } from '@/generators/react';
import { parseJsx } from '..';
import { runTestsForTarget } from './test-generator';

import columns from './data/blocks/columns.raw.tsx?raw';
import stamped from './data/blocks/stamped-io.raw.tsx?raw';

describe('React - stateType: useState', () => {
  runTestsForTarget({
    options: {
      stateType: 'useState',
    },
    target: 'react',
    generator: componentToReact,
  });
  runTestsForTarget({
    options: {
      stateType: 'useState',
      stylesType: 'styled-components',
    },
    target: 'react',
    generator: componentToReact,
  });
  test('stamped (useState)', () => {
    const component = parseJsx(stamped);
    const output = componentToReact({
      stylesType: 'style-tag',
      stateType: 'useState',
    })({ component });
    expect(output).toMatchSnapshot();
  });

  test('stamped (mobx)', () => {
    const component = parseJsx(stamped);
    const output = componentToReact({
      stylesType: 'style-tag',
      stateType: 'mobx',
    })({ component });
    expect(output).toMatchSnapshot();
  });

  test('(style-tag, top)', () => {
    const component = parseJsx(columns);
    const output = componentToReact({
      stylesType: 'style-tag',
      styleTagsPlacement: 'top',
    })({ component });
    expect(output).toMatchSnapshot();
  });
});

/*describe('React - test', () => {
  runTestsForTarget({
    options: {
      stateType: 'useState',
    },
    target: 'react',
    generator: componentToReact,
    only: ['defaultProps'],
    logOutput: true,
  });
});*/
