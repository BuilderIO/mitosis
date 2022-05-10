import { componentToAngular } from '../generators/angular';
import { parseJsx } from '../parsers/jsx';

const onUpdate = require('./data/blocks/onUpdate.raw');
const onMount = require('./data/blocks/onMount.raw');
const onInitonMount = require('./data/blocks/onInit-onMount.raw');
const onInit = require('./data/blocks/onInit.raw');
const basicFor = require('./data/basic-for.raw');
const slot = require('./data/blocks/slot.raw');

describe('Angular', () => {
  test('onUpdate', () => {
    const component = parseJsx(onUpdate);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onMount', () => {
    const component = parseJsx(onMount);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onInit and onMount', () => {
    const component = parseJsx(onInitonMount);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onInit', () => {
    const component = parseJsx(onInit);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('BasicFor', () => {
    const component = parseJsx(basicFor);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('ng-content', () => {
    const component = parseJsx(slot);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });
});
