import { collectCss } from './collect-css';
import { parseJsx } from '../../parsers/jsx';

const classRaw = require('../../__tests__/data/styles/class.raw');
const classState = require('../../__tests__/data/styles/classState.raw');

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
