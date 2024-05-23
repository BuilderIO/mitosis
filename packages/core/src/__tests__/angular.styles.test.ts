import { componentToAngular } from '../generators/angular';
import { runTestsForTarget } from './test-generator';

describe('Angular with visuallyIgnoreHostElement = false', () => {
  runTestsForTarget({
    options: {
      visuallyIgnoreHostElement: false,
    },
    target: 'angular',
    generator: componentToAngular,
  });
});
