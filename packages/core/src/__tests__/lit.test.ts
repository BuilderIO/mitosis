import { componentToLit } from '../generators/lit';
import { runTestsForTarget } from './test-generator';

describe('Lit', () => {
  runTestsForTarget({ options: {}, target: 'lit', generator: componentToLit });
});
