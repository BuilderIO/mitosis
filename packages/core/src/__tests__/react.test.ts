import { componentToReact } from '../generators/react';
import { parse } from '../parse';
import { basic } from './data/basic';
import { inputBlock } from './data/blocks/input';
import { submitButtonBlock } from './data/blocks/submitButton';

describe('React', () => {
  test('Basic', () => {
    const json = parse(basic);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });

  test('Input block', () => {
    const json = parse(inputBlock);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });

  test('Submit button block', () => {
    const json = parse(submitButtonBlock);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });
});
