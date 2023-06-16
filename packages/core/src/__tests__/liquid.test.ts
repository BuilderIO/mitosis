import { componentToLiquid } from '../generators/liquid';
import { runTestsForTarget } from './test-generator';

describe('Liquid', () => {
  runTestsForTarget({ options: {}, target: 'liquid', generator: componentToLiquid });
});
