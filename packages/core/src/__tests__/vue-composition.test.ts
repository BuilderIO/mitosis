import { componentToVue3 } from '../generators/vue';
import { runTestsForTarget } from './shared';

describe('Vue', () => {
  runTestsForTarget('vue', componentToVue3({ api: 'composition' }));
});
