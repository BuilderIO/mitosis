import { componentToAngular } from '@/generators/angular';
import { runTestsForTarget } from './test-generator';

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
