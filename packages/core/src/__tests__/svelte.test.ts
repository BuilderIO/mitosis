import { componentToSvelte } from '../generators/svelte';
import { parseJsx } from '../parsers/jsx';
const basic = require('./data/basic.raw');
const inputBlock = require('./data/blocks/input.raw');
const selectBlock = require('./data/blocks/select.raw');
const formBlock = require('./data/blocks/form.raw');
const submitButtonBlock = require('./data/blocks/submit-button.raw');
const button = require('./data/blocks/button.raw');
const textarea = require('./data/blocks/textarea.raw');
const img = require('./data/blocks/img.raw');

describe('Vue', () => {
  test('Basic', () => {
    const json = parseJsx(basic);
    const output = componentToSvelte(json);
    expect(output).toMatchSnapshot();
  });

  test('Input block', () => {
    const json = parseJsx(inputBlock);
    const output = componentToSvelte(json);
    expect(output).toMatchSnapshot();
  });

  test('Submit button block', () => {
    const json = parseJsx(submitButtonBlock);
    const output = componentToSvelte(json);
    expect(output).toMatchSnapshot();
  });

  test('Select block', () => {
    const json = parseJsx(selectBlock);
    const output = componentToSvelte(json);
    expect(output).toMatchSnapshot();
  });

  test('Form block', () => {
    const json = parseJsx(formBlock);
    const output = componentToSvelte(json);
    expect(output).toMatchSnapshot();
  });

  test('Button', () => {
    const json = parseJsx(button);
    const output = componentToSvelte(json);
    expect(output).toMatchSnapshot();
  });

  test('Textarea', () => {
    const json = parseJsx(textarea);
    const output = componentToSvelte(json);
    expect(output).toMatchSnapshot();
  });

  test('Img', () => {
    const json = parseJsx(img);
    const output = componentToSvelte(json);
    expect(output).toMatchSnapshot();
  });
});
