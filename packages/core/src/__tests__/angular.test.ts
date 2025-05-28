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

/*describe('Angular local', () => {
  runTestsForTarget({
    options: {
      standalone: true,
    },
    target: 'angular',
    generator: componentToAngular,
    only: [
      'prettierInline'
    ],
    logOutput: true,
  });
});*/
