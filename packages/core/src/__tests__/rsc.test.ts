import { componentToRsc } from '../generators/rsc';
import { runTestsForTarget } from './test-generator';

describe('RSC', () => {
  runTestsForTarget({ options: {}, target: 'rsc', generator: componentToRsc });
});
