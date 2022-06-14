import { componentToReact } from '../generators/react';
import { getMultipleOnUpdateTests, getTestsForGenerator } from './shared';

describe('React', () => {
  getTestsForGenerator(componentToReact());
  getMultipleOnUpdateTests(componentToReact());
});
