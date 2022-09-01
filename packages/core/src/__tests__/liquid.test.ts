import { componentToLiquid } from '../generators/liquid';
import { runTestsForTarget } from './shared';

describe('Liquid', () => {
  runTestsForTarget({ options: {}, target: 'liquid', generator: componentToLiquid });
});
