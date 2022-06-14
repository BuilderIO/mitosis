import { parseJsx } from '..';
import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './shared';

const stamped = require('./data/blocks/stamped-io.raw');
describe('React', () => {
  runTestsForTarget('react', componentToReact());
  test('stamped', () => {
    const component = parseJsx(stamped);
    const output = componentToReact({
      stylesType: 'styled-components',
      stateType: 'useState',
    })({ component });
    expect(output).toMatchSnapshot();
  });
});
