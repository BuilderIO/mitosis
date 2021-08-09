import { parseJsx } from '../parsers/jsx';
import { contextToReact } from '../generators/context/react';
import { parseContext } from '../parsers/context';
import { componentToReact } from '../generators/react';

const simpleExample = require('./data/context/simple.context.lite');
const componentWithContext = require('./data/context/component-with-context.lite');

describe('Context', () => {
  test('Parse context', () => {
    const json = parseContext(simpleExample, { name: 'SimpleExample' });
    if (!json) {
      throw new Error('No parseable context found for simple.context.lite.ts');
    }
    expect(json).toMatchSnapshot();
    const reactContext = contextToReact(json);
    expect(reactContext).toMatchSnapshot();
  });

  test('Use and set context in components', () => {
    const json = parseJsx(componentWithContext);
    expect(json).toMatchSnapshot();
    const reactComponent = componentToReact(json);
    expect(reactComponent).toMatchSnapshot();
  });
});
