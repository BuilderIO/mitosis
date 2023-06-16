import { componentToVue3 } from '../generators/vue';
import { runTestsForTarget } from './test-generator';

describe('Vue', () => {
  runTestsForTarget({ target: 'vue', generator: componentToVue3, options: { api: 'composition' } });
});
