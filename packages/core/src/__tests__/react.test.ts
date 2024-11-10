import { parseJsx } from '..';
import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './test-generator';

import stamped from './data/blocks/stamped-io.raw.tsx?raw';

describe('React - stateType: useState', () => {
  runTestsForTarget({
    options: {
      stateType: 'useState',
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
});

describe('React - only', () => {
  runTestsForTarget({
    options: {
      stateType: 'useState',
    },
    target: 'react',
    generator: componentToReact,
    only: ['figmaMeta'],
    logOutput: true,
  });
});
