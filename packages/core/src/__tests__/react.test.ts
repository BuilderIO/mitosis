import { componentToReact } from '../generators/react';
import { getTestsForGenerator } from './shared';

describe('React', () => {
  getTestsForGenerator(componentToReact());
});
