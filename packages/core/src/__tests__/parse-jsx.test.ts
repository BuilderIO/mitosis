import { parseStateObjectToMitosisState } from '../parsers/jsx/state';
import { parseJsx } from '../parsers/jsx';
import { SPEC } from './data/jsx-json.spec';
import { runTestsForJsx } from './shared';

const buttonWithMetadata = require('./data/blocks/button-with-metadata.raw');
const basicPropsRaw = require('./data/basic-props.raw');
const basicBooleanAttribute = require('./data/basic-boolean-attribute.raw');
const basicPropsDestructureRaw = require('./data/basic-props-destructure.raw');

describe('Parse JSX', () => {
  test('parseStateObject', () => {
    const out = parseStateObjectToMitosisState(SPEC);
    expect(out).toMatchSnapshot();
  });
  test('boolean attribute', () => {
    const out = parseJsx(basicBooleanAttribute);
    expect(out).toMatchSnapshot();
  });
  test('metadata', () => {
    const json = parseJsx(buttonWithMetadata);
    expect(json).toMatchSnapshot();
  });

  test('custom mitosis package', () => {
    expect(parseJsx(basicPropsRaw)).toEqual(parseJsx(basicPropsDestructureRaw));
  });

  runTestsForJsx();
});
