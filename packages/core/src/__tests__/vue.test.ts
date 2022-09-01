import { componentToVue2 } from '../generators/vue';
import { runTestsForTarget } from './shared';

describe('Vue', () => {
  runTestsForTarget({ options: { api: 'options' }, target: 'vue', generator: componentToVue2 });
});
