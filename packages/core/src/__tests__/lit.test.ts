import { componentToLit } from '../generators/lit';
import { runTestsForTarget } from './shared';

describe('Lit', () => {
  runTestsForTarget({ options: {}, target: 'lit', generator: componentToLit });
});
