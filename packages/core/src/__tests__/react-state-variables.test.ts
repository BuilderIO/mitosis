import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './test-generator';

describe('React - stateType: variables', () => {
  runTestsForTarget({
    options: {
      stateType: 'variables',
    },
    target: 'react',
    generator: componentToReact,
  });
});
