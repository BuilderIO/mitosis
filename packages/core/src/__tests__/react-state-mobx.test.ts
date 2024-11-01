import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './test-generator';

describe('React - stateType: mobx', () => {
  runTestsForTarget({
    options: {
      stateType: 'mobx',
    },
    target: 'react',
    generator: componentToReact,
  });
});
