import { componentToAlpine } from '../generators/alpine';
import { runTestsForTarget } from './shared';

describe('Alpine.js', () => {
  runTestsForTarget({ options: {}, target: 'alpine', generator: componentToAlpine });
  // runTestsForTarget({
  //   options: {
  //     standalone: true,
  //   },
  //   target: 'alpine',
  //   generator: componentToAlpine,
  // });
});
