import { parseJsx } from '../parsers/jsx';

const classRaw = require('./data/styles/class.raw');
const className = require('./data/styles/className.raw');
const classAndClassName = require('./data/styles/class-and-className.raw');

describe('Styles', () => {
  test('class and className are equivalent', () => {
    expect(parseJsx(classRaw)).toMatchSnapshot(className);
  });
  test('class and className are merged', () => {
    const component = parseJsx(classAndClassName);
    expect(component).toMatchSnapshot();
  });
});
