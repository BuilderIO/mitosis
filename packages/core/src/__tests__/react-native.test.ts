import { componentToReactNative } from '../generators/react-native';
import { runTestsForTarget } from './shared';

describe('React Native', () => {
  runTestsForTarget({ options: {}, target: 'reactNative', generator: componentToReactNative });
});
