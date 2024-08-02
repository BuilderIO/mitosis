import { componentToReactNative } from '../generators/react-native';
import { runTestsForTarget } from './test-generator';

import { parseJsx } from '..';
import twrncStateComplexStyledComponentRN from './data/react-native/twrnc-state-complex-styled-component.raw.tsx?raw';
import twrncStateStyledComponentRN from './data/react-native/twrnc-state-styled-component.raw.tsx?raw';
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

  test('twrnc state style', () => {
    const component = parseJsx(twrncStateStyledComponentRN);
    const output = componentToReactNative({
      stylesType: 'twrnc',
    })({ component });

    expect(output).toMatchSnapshot();
  });

  test('twrnc state complex style', () => {
    const component = parseJsx(twrncStateComplexStyledComponentRN);
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
