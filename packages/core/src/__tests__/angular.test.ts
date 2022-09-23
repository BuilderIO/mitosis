import { componentToAngular } from '../generators/angular';
import { runTestsForTarget } from './shared';

describe('Angular', () => {
  runTestsForTarget({ options: {}, target: 'angular', generator: componentToAngular });
  runTestsForTarget({
    options: {
      standalone: true,
    },
    target: 'angular',
    generator: componentToAngular,
  });
});

describe('Angular with Preserve Imports', () => {
  runTestsForTarget({ options: {}, target: 'angular', generator: componentToAngular });
  runTestsForTarget({
    options: {
      preserveImports: true,
    },
    target: 'angular',
    generator: componentToAngular,
  });
});
