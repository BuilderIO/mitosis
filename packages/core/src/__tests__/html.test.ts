import { componentToHtml } from '../generators/html';
import { runTestsForTarget } from './shared';

describe('Html', () => {
  runTestsForTarget('html', componentToHtml());
});
