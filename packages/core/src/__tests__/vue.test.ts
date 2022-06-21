import { componentToVue } from '../generators/vue';
import { runTestsForTarget } from './shared';

describe('Vue', () => {
  runTestsForTarget('vue', componentToVue({ vueVersion: 2 }));
});
