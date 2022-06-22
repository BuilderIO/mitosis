import { componentToVue2 } from '../generators/vue';
import { runTestsForTarget } from './shared';

describe('Vue', () => {
  runTestsForTarget('vue', componentToVue2());
});
