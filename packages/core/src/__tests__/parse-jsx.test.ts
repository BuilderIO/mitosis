import { parseJsx } from '../parsers/jsx';

const buttonWithMetadata = require('./data/blocks/button-with-metadata.raw');

describe('Parse JSX', () => {
  test('metadata', () => {
    const json = parseJsx(buttonWithMetadata);
    expect(json).toMatchSnapshot();
  });
});
