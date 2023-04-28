import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './test-generator';

describe('Preact', () => {
  runTestsForTarget({
    options: { preact: true },
    target: 'react',
    generator: componentToReact,
  });
});
