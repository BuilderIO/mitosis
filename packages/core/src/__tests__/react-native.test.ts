import { componentToReactNative } from '../generators/react-native';
import { runTestsForTarget } from './test-generator';

describe('React Native', () => {
  runTestsForTarget({ options: {}, target: 'reactNative', generator: componentToReactNative });
});
