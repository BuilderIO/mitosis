import { parseJsx } from '../parsers/jsx';

import classAndClassName from './data/styles/class-and-className.raw.tsx?raw';
import classRaw from './data/styles/class.raw.tsx?raw';
import className from './data/styles/className.raw.tsx?raw';

describe('Styles', () => {
  test('class and className are equivalent', () => {
    expect(parseJsx(classRaw)).toEqual(parseJsx(className));
  });
  test('class and CSS are merged', () => {
    const component = parseJsx(classRaw);
    expect(component).toMatchSnapshot();
  });
  test('className and CSS are merged', () => {
    const component = parseJsx(className);
    expect(component).toMatchSnapshot();
  });
  test('class and className are merged', () => {
    const component = parseJsx(classAndClassName);
    expect(component).toMatchSnapshot();
  });
});
