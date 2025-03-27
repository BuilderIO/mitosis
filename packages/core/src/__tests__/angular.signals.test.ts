import { componentToAngular } from '@/generators/angular';
import { runTestsForTarget } from './test-generator';

describe('Angular signals', () => {
  runTestsForTarget({
    options: {
      standalone: true,
      api: 'signals',
    },
    target: 'angular',
    generator: componentToAngular,
  });
});

/*describe('Angular signals local', () => {
  runTestsForTarget({
    options: {
      standalone: true,
      api: 'signals',
      typescript: true,
    },
    target: 'angular',
    generator: componentToAngular,
    only: [
      // 'signals'
      // 'eventProps',
      // 'basicRefAttributePassing',
      // 'eventInputAndChange',
      // "spreadAttrs", // TODO: spreads
      // "dynamicComponentWithEventArg" // TODO: add dynamic components
      'Basic',
    ],
    logOutput: true,
  });
});*/
