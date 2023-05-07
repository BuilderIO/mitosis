import { componentToPreact } from '../generators/preact';
import { runTestsForTarget } from './test-generator';

describe('Preact', () => {
  runTestsForTarget({
    options: {},
    target: 'preact',
    generator: componentToPreact,
  });
});
