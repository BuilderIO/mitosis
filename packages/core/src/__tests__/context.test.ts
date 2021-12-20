import { parseJsx } from '../parsers/jsx';
import { contextToReact } from '../generators/context/react';
import { parseContext } from '../parsers/context';
import { componentToReact } from '../generators/react';
import { componentToReactNative } from '../generators/react-native';

const simpleExample = require('./data/context/simple.context.lite');
const componentWithContext = require('./data/context/component-with-context.lite');
const renderBlock = require('./data/blocks/builder-render-block.raw');

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
