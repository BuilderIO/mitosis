import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './test-generator';

describe('React - stateType: valtio', () => {
  runTestsForTarget({
    options: {
      stateType: 'valtio',
    },
    target: 'react',
    generator: componentToReact,
  });
});
