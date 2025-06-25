import { componentToAngular } from '@/generators/angular';
import { runTestsForTarget } from './test-generator';

describe('Angular with manually creating and handling class properties as bindings (more stable)', () => {
  runTestsForTarget({
    options: {
      state: 'class-properties',
    },
    target: 'angular',
    generator: componentToAngular,
  });
});
