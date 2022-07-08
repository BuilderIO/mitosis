import { componentToSvelte } from '../generators/svelte';
import { runTestsForTarget } from './shared';

describe('Svelte', () => {
  runTestsForTarget('svelte', componentToSvelte());
});
