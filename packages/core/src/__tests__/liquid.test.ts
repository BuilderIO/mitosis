import { componentToLiquid } from '../generators/liquid';
import { runTestsForTarget } from './shared';

describe('Liquid', () => {
  runTestsForTarget('liquid', componentToLiquid());
});
