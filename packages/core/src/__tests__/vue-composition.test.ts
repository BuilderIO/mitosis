import { componentToVue } from '../generators/vue';
import { runTestsForTarget } from './test-generator';

describe('Vue', () => {
  runTestsForTarget({ target: 'vue', generator: componentToVue, options: { api: 'composition' } });
});
