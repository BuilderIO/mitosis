import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './shared';

describe('Preact', () => {
  runTestsForTarget('react', componentToReact({ preact: true }));
});
