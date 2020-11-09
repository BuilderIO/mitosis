import { componentToReact } from '../generators/react';
import { parse } from '../parse';
import { basic } from './data/basic';

describe('React', () => {
  test('Basic', () => {
    const json = parse(basic);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });
})
