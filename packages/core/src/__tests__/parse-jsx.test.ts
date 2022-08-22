import { parseStateObjectToMitosisState } from '../parsers/jsx/state';
import { parseJsx } from '../parsers/jsx';
import { SPEC } from './data/jsx-json.spec';

const buttonWithMetadata = require('./data/blocks/button-with-metadata.raw');
const image = require('./data/blocks/image.raw');
const basicOnUpdateReturn = require('./data/basic-onUpdate-return.raw');
const basicMitosis = require('./data/basic-custom-mitosis-package.raw');
const basicRef = require('./data/basic-ref.raw');
const basicPropsRaw = require('./data/basic-props.raw');
const basicPropsDestructureRaw = require('./data/basic-props-destructure.raw');

describe('Parse JSX', () => {
  test('parseStateObject', () => {
    const out = parseStateObjectToMitosisState(SPEC as any);
    expect(out).toMatchSnapshot();
  });
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

  test('custom mitosis package', () => {
    expect(parseJsx(basicPropsRaw)).toEqual(parseJsx(basicPropsDestructureRaw));
  });
});
