import { parseJsx } from '../parsers/jsx';

const buttonWithMetadata = require('./data/blocks/button-with-metadata.raw');
const image = require('./data/blocks/image.raw');
const basicOnUpdateReturn = require('./data/basic-onUpdate-return.raw');
const basicMitosis = require('./data/basic-custom-mitosis-package.raw');
const basicRef = require('./data/basic-ref.raw');
const basicPropsRaw = require('./data/basic-props.raw');
const basicPropsDestructureRaw = require('./data/basic-props-destructure.raw');
const basicStateRaw = require('./data/basic-state.raw');
const basicStateDestructureRaw = require('./data/basic-state-destructure.raw');

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

  test('custom mitosis package', () => {
    const json = parseJsx(basicMitosis, {
      compileAwayPackages: ['@dummy/custom-mitosis'],
    });
    expect(json).toMatchSnapshot();
  });

  test('support props destructure', () => {
    expect(parseJsx(basicPropsRaw)).toEqual(parseJsx(basicPropsDestructureRaw));
  });

  test('support state destructure', () => {
    expect(parseJsx(basicStateRaw)).toEqual(parseJsx(basicStateDestructureRaw));
  });
});
