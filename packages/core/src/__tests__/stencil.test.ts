import { componentToStencil } from '../generators/stencil';
import { getTestsForGenerator } from './shared';

describe('Stencil', () => {
  getTestsForGenerator(componentToStencil());
});
