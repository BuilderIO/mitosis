import { contextToReact } from '../generators/context/react';
import { componentToReact } from '../generators/react';
import { componentToReactNative } from '../generators/react-native';
import { parseContext } from '../parsers/context';
import { parseJsx } from '../parsers/jsx';

import renderBlock from './data/blocks/builder-render-block.raw.tsx?raw';
import componentWithContext from './data/context/component-with-context.raw.tsx?raw';
import simpleExample from './data/context/simple.context.lite.ts?raw';

describe('Context', () => {
  test('Parse context', () => {
    const component = parseContext(simpleExample, { name: 'SimpleExample' });
    if (!component) {
      throw new Error('No parseable context found for simple.context.lite.ts');
    }
    expect(component).toMatchSnapshot();
    const reactContext = contextToReact()({ context: component });
    expect(reactContext).toMatchSnapshot();
  });

  test('Use and set context in components', () => {
    const component = parseJsx(componentWithContext);
    expect(component).toMatchSnapshot();
    const reactComponent = componentToReact()({ component });
    expect(reactComponent).toMatchSnapshot();

    const reactNativeComponent = componentToReactNative()({ component });
    expect(reactNativeComponent).toMatchSnapshot();
  });

  test('Use and set context in complex components', () => {
    const component = parseJsx(renderBlock);
    expect(component).toMatchSnapshot();
    const reactComponent = componentToReact()({ component });
    expect(reactComponent).toMatchSnapshot();
  });
});
