import { parseJsx } from '../parsers/jsx';

const buttonWithMetadata = require('./data/blocks/button-with-metadata.raw');
const image = require('./data/blocks/image.raw');
const basicOnUpdateReturn = require('./data/basic-onUpdate-return.raw');
const basicRef = require('./data/basic-ref.raw');

describe('Parse JSX', () => {
  test('metadata', () => {
    const json = parseJsx(buttonWithMetadata);
    expect(json).toMatchSnapshot();
  });

  test('Image', () => {
    const json = parseJsx(image);
    expect(json).toMatchSnapshot();
  });
  test('onUpdate return', () => {
    const json = parseJsx(basicOnUpdateReturn);
    expect(json).toMatchSnapshot();
  });

  test('useRef', () => {
    const json = parseJsx(basicRef);
    expect(json).toMatchSnapshot();
  });
});
