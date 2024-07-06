import { componentToReactNative } from '../generators/react-native';
import { runTestsForTarget } from './test-generator';

import { parseJsx } from '..';
import twrncStyledComponentRN from './data/react-native/twrnc-styled-component.raw.tsx?raw';

describe('React Native', () => {
  runTestsForTarget({ options: {}, target: 'reactNative', generator: componentToReactNative });

  test('twrnc style', () => {
    const component = parseJsx(twrncStyledComponentRN);
    const output = componentToReactNative({
      stylesType: 'twrnc',
    })({ component });

    expect(output).toMatchSnapshot();
  });

  test('native-wind style', () => {
    const component = parseJsx(twrncStyledComponentRN);
    const output = componentToReactNative({
      stylesType: 'native-wind',
    })({ component });

    expect(output).toMatchSnapshot();
  });
});
