import { componentToAngular } from '../generators/angular';
import {
  getFormBlockTests,
  getMultipleOnUpdateTests,
  getTestsForGenerator,
} from './shared';

describe('Angular', () => {
  getTestsForGenerator(componentToAngular());
  getMultipleOnUpdateTests(componentToAngular());
  getFormBlockTests(componentToAngular());
});
