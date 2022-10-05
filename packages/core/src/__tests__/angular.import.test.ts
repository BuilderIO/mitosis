import { componentToAngular } from '../generators/angular';
import { runTestsForTarget } from './shared';

describe('Angular with Preserve Imports and File Extensions', () => {
  runTestsForTarget({
    options: {
      preserveImports: true,
      preserveFileExtensions: true,
    },
    target: 'angular',
    generator: componentToAngular,
  });
});
