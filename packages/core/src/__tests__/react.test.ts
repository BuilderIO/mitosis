import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './test-generator';

describe('React', () => {
  runTestsForTarget({ options: {}, target: 'react', generator: componentToReact });
});
