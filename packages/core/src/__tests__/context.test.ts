import { contextToReact } from '../generators/context/react';
import { parseContext } from '../parsers/context';

const simpleExample = require('./data/context/simple.context.lite');

describe('Context', () => {
  test('Simple example', () => {
    const json = parseContext(simpleExample, { name: 'SimpleExample' });
    if (!json) {
      throw new Error('No parseable context found for simple.context.lite.ts');
    }
    const reactContext = contextToReact(json);
    expect(reactContext).toMatchSnapshot();
  });
});
