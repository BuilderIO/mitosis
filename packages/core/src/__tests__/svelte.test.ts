import { componentToSvelte } from '../generators/svelte';
import { runTestsForTarget } from './test-generator';

describe('Svelte', () => {
  runTestsForTarget({ target: 'svelte', generator: componentToSvelte, options: {} });
});
