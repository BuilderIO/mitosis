import { componentToAngular } from '../generators/angular';
import { runTestsForTarget } from './shared';

describe('Angular with Preserve Imports', () => {
  runTestsForTarget({
    options: {
      preserveImports: true,
    },
    target: 'angular',
    generator: componentToAngular,
  });
});
