import { componentToVue3 } from '../generators/vue';
import { runTestsForTarget } from './shared';

describe('Vue', () => {
  runTestsForTarget({ target: 'vue', generator: componentToVue3, options: { api: 'composition' } });
});
