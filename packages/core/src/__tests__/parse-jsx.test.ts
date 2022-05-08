import { parseJsx } from '../parsers/jsx';

const buttonWithMetadata = require('./data/blocks/button-with-metadata.raw');
const basicGetter = require('./data/basic-getter.raw');
const image = require('./data/blocks/image.raw');

describe('Parse JSX', () => {
  test('state getters', () => {
    const json = parseJsx(basicGetter);
    expect(json).toMatchSnapshot();
  });

  test('metadata', () => {
    const json = parseJsx(buttonWithMetadata);
    expect(json).toMatchSnapshot();
  });

  test('Image', () => {
    const json = parseJsx(image);
    expect(json).toMatchSnapshot();
  });
});
