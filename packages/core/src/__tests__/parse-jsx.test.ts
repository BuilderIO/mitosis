import { parseStateObjectToMitosisState } from '../parsers/jsx/state';
import { parseJsx } from '../parsers/jsx';
import { SPEC } from './data/jsx-json.spec';
import { runTestsForJsx } from './test-generator';

import buttonWithMetadata from './data/blocks/button-with-metadata.raw.tsx?raw';
import basicPropsRaw from './data/basic-props.raw.tsx?raw';
import basicBooleanAttribute from './data/basic-boolean-attribute.raw.tsx?raw';
import basicPropsDestructureRaw from './data/basic-props-destructure.raw.tsx?raw';

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
