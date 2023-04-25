import { componentToVue2 } from '../generators/vue';
import { runTestsForTarget } from './test-generator';

describe('Vue', () => {
  runTestsForTarget({ options: { api: 'options' }, target: 'vue', generator: componentToVue2 });
});
