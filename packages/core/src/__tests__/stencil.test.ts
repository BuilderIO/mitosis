import { componentToStencil } from '../generators/stencil';
import { runTestsForTarget } from './shared';

describe('Stencil', () => {
  runTestsForTarget({
    target: 'stencil',
    generator: componentToStencil,
    options: {},
  });
});
