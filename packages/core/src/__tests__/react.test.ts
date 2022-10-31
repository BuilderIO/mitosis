import { parseJsx } from '..';
import { componentToReact } from '../generators/react';
import { runTestsForTarget } from './shared';

const stamped = require('./data/blocks/stamped-io.raw');

describe('React', () => {
  runTestsForTarget({ options: {}, target: 'react', generator: componentToReact });
  test('stamped (useState)', () => {
    const component = parseJsx(stamped);
    const output = componentToReact({
      stylesType: 'style-tag',
      stateType: 'useState',
    })({ component });
    expect(output).toMatchSnapshot();
  });

  test('stamped (mobx)', () => {
    const component = parseJsx(stamped);
    const output = componentToReact({
      stylesType: 'style-tag',
      stateType: 'mobx',
    })({ component });
    expect(output).toMatchSnapshot();
  });
});
