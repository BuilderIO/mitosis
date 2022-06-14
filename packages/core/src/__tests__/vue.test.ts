import { Transpiler } from '..';
import { componentToVue } from '../generators/vue';
import { getMultipleOnUpdateTests, getTestsForGenerator } from './shared';

describe('Vue', () => {
  getTestsForGenerator(componentToVue() as Transpiler);
  getMultipleOnUpdateTests(componentToVue() as Transpiler);
});
