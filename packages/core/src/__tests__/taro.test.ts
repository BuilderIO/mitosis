import { componentToTaro } from '../generators/taro';
import { runTestsForTarget } from './test-generator';

describe('Taro', () => {
  runTestsForTarget({ options: {}, target: 'taro', generator: componentToTaro });
});
