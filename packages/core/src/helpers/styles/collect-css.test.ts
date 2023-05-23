import { parseJsx } from '../../parsers/jsx';
import { collectCss } from './collect-css';

import classRaw from '../../__tests__/data/styles/class.raw.tsx?raw';
import classState from '../../__tests__/data/styles/classState.raw.tsx?raw';

describe('Styles', () => {
  test('class property and CSS are merged', () => {
    const component = parseJsx(classRaw);
    const output = collectCss(component);
    expect({ component, output }).toMatchSnapshot();
  });
  test('class binding and CSS are merged', () => {
    const component = parseJsx(classState);
    const output = collectCss(component);
    expect({ component, output }).toMatchSnapshot();
  });
});
