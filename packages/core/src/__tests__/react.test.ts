import { componentToReact } from '../generators/react';
import { parse } from '../parse';
const basic = require('./data/basic.raw');
const inputBlock = require('./data/blocks/input.raw');
const submitButtonBlock = require('./data/blocks/submit-button.raw');

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
