import { componentToAngular } from '../generators/angular';
import { runTestsForTarget } from './shared';

describe('Angular', () => {
  runTestsForTarget('angular', componentToAngular());
});
