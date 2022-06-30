import { parseJsx } from '../parsers/jsx';

const classRaw = require('./data/styles/class.raw');
const className = require('./data/styles/className.raw');
const classAndClassName = require('./data/styles/class-and-className.raw');

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
