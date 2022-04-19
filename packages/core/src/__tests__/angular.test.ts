import { componentToAngular } from '../generators/angular';
import { parseJsx } from '../parsers/jsx';

const onUpdate = require('./data/blocks/onUpdate.raw');
const slot = require('./data/blocks/slot.raw');

describe('Angular', () => {
  test('onUpdate', () => {
    const component = parseJsx(onUpdate);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('ng-content', () => {
    const component = parseJsx(slot);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });
});
