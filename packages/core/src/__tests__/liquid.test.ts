import { componentToLiquid } from '../generators/liquid';
import { parseJsx } from '../parsers/jsx';
const basic = require('./data/basic.raw');
const inputBlock = require('./data/blocks/input.raw');
const selectBlock = require('./data/blocks/select.raw');
const formBlock = require('./data/blocks/form.raw');
const submitButtonBlock = require('./data/blocks/submit-button.raw');

describe('Liquid', () => {
  test('Basic', () => {
    const json = parseJsx(basic);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });

  test('Input block', () => {
    const json = parseJsx(inputBlock);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });

  test('Submit button block', () => {
    const json = parseJsx(submitButtonBlock);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });

  test('Select block', () => {
    const json = parseJsx(selectBlock);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });
  
  test('Form block', () => {
    const json = parseJsx(formBlock);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });
});
