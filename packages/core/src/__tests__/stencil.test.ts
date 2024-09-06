import { componentToStencil } from '@/generators/stencil';
import { runTestsForTarget } from './test-generator';

describe('Stencil', () => {
  runTestsForTarget({
    target: 'stencil',
    generator: componentToStencil,
    options: {},
  });
});
