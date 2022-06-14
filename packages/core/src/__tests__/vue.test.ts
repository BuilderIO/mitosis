import { Transpiler } from '..';
import { componentToVue } from '../generators/vue';
import { runTestsForTarget } from './shared';

describe('Vue', () => {
  runTestsForTarget('vue', componentToVue() as Transpiler);
});
