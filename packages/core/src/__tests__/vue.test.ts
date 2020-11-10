import { componentToVue } from '../generators/vue';
import { parse } from '../parse';
const basic = require('./data/basic.raw');
const inputBlock = require('./data/blocks/input.raw');
const selectBlock = require('./data/blocks/select.raw');
const formBlock = require('./data/blocks/form.raw');
const submitButtonBlock = require('./data/blocks/submit-button.raw');

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

  test('Submit button block', () => {
    const json = parse(submitButtonBlock);
    const output = componentToVue(json);
    expect(output).toMatchSnapshot();
  });

  test('Select block', () => {
    const json = parse(selectBlock);
    const output = componentToVue(json);
    expect(output).toMatchSnapshot();
  });

  test('Form block', () => {
    const json = parse(formBlock);
    const output = componentToVue(json);
    expect(output).toMatchSnapshot();
  });
});
