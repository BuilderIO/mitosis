import { componentToRsc } from '../generators/rsc';
import { runTestsForTarget } from './shared';

describe('RSC', () => {
  runTestsForTarget({ options: {}, target: 'rsc', generator: componentToRsc });
});
