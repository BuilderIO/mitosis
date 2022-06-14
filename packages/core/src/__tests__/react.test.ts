import { componentToReact } from '../generators/react';
import {
  getFormBlockTests,
  getMultipleOnUpdateTests,
  getTestsForGenerator,
} from './shared';

describe('React', () => {
  getTestsForGenerator(componentToReact());
  getMultipleOnUpdateTests(componentToReact());
  getFormBlockTests(componentToReact());
});
