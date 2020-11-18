import { componentToReact } from '../generators/react';
import { parseJsx } from '../parsers/jsx';
const basic = require('./data/basic.raw');
const submitButtonBlock = require('./data/blocks/submit-button.raw');
const inputBlock = require('./data/blocks/input.raw');
const selectBlock = require('./data/blocks/select.raw');
const formBlock = require('./data/blocks/form.raw');
const button = require('./data/blocks/button.raw');

describe('React', () => {
  test('Basic', () => {
    const json = parseJsx(basic);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });

  test('Input block', () => {
    const json = parseJsx(inputBlock);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });

  test('Submit button block', () => {
    const json = parseJsx(submitButtonBlock);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });

  test('Select block', () => {
    const json = parseJsx(selectBlock);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });

  test('Form block', () => {
    const json = parseJsx(formBlock);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });

  test('Button', () => {
    const json = parseJsx(button);
    const output = componentToReact(json);
    expect(output).toMatchSnapshot();
  });
});
