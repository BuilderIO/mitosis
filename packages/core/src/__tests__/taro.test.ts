import { componentToTaro } from '../generators/taro';
import { runTestsForTarget } from './shared';

describe('Taro', () => {
  runTestsForTarget({ options: {}, target: 'taro', generator: componentToTaro });
});
