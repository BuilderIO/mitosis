import { componentToSvelte } from '../generators/svelte';
import { parseJsx } from '../parsers/jsx';

const buttonWithMetadata = require('./data/blocks/button-with-metadata.raw');
const functionComponent = require('./data/proper-react.raw');

describe('Parse JSX', () => {
  test('metadata', () => {
    const json = parseJsx(buttonWithMetadata);
    expect(json).toMatchSnapshot();
  });
});

describe('React JSX', () => {
  test('parse function component', () => {
    const json = parseJsx(functionComponent);
    let svelte = componentToSvelte(json, {
      prettier: true,
      stateType: 'variables',
    });

    expect(json).toMatchSnapshot();

    expect(svelte).toMatchSnapshot();
  });
});
