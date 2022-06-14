import { componentToAngular } from '../generators/angular';
import { getMultipleOnUpdateTests, getTestsForGenerator } from './shared';

describe('Angular', () => {
  getTestsForGenerator(componentToAngular());
  getMultipleOnUpdateTests(componentToAngular());
});
