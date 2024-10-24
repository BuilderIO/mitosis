import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './test-generator';

describe('React - stateType: builder', () => {
  runTestsForTarget({
    options: {
      stateType: 'builder',
    },
    target: 'react',
    generator: componentToReact,
  });
});
