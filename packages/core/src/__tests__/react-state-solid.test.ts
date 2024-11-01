import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './test-generator';

describe('React - stateType: solid', () => {
  runTestsForTarget({
    options: {
      stateType: 'solid',
    },
    target: 'react',
    generator: componentToReact,
  });
});
