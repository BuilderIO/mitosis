import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './shared';

describe('Preact', () => {
  runTestsForTarget({
    options: { preact: true },
    target: 'react',
    generator: componentToReact,
  });
});
