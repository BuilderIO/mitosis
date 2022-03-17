import { parseJsx } from '../parsers/jsx';

const buttonWithMetadata = require('./data/blocks/button-with-metadata.raw');
const image = require('./data/blocks/image.raw');

describe('Parse JSX', () => {
  test('metadata', () => {
    const json = parseJsx(buttonWithMetadata);
    expect(json).toMatchSnapshot();
  });

  test('Image', () => {
    const json = parseJsx(image);
    expect(json).toMatchSnapshot();
  });
});
