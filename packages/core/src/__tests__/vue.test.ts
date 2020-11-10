import { componentToReact } from '../generators/react';
import { componentToVue } from '../generators/vue';
import { parse } from '../parse';
import { basic } from './data/basic';
import { inputBlock } from './data/blocks/input';

describe('Vue', () => {
  test('Basic', () => {
    const json = parse(basic);
    const output = componentToVue(json);
    expect(output).toMatchSnapshot();
  });

  test('Input block', () => {
    const json = parse(inputBlock);
    const output = componentToVue(json);
    expect(output).toMatchSnapshot();
  });
});
