import { componentToAngular } from '@/generators/angular';
import { runTestsForTarget } from './test-generator';

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
