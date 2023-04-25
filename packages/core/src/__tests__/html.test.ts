import { componentToHtml } from '../generators/html';
import { runTestsForTarget } from './test-generator';

describe('Html', () => {
  runTestsForTarget({ options: {}, target: 'html', generator: componentToHtml });
});
