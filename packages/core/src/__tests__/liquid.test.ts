import { componentToLiquid } from '../generators/liquid';
import { parseJsx } from '../parsers/jsx';
const basic = require('./data/basic.raw');
const submitButtonBlock = require('./data/blocks/submit-button.raw');
const inputBlock = require('./data/blocks/input.raw');
const selectBlock = require('./data/blocks/select.raw');
const formBlock = require('./data/blocks/form.raw');
const button = require('./data/blocks/button.raw');
const textarea = require('./data/blocks/textarea.raw');
const img = require('./data/blocks/img.raw');
const video = require('./data/blocks/video.raw');
const section = require('./data/blocks/section.raw');
const text = require('./data/blocks/text.raw');

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

  test('Button', () => {
    const json = parseJsx(button);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });

  test('Textarea', () => {
    const json = parseJsx(textarea);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });

  test('Img', () => {
    const json = parseJsx(img);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });

  test('Video', () => {
    const json = parseJsx(video);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });

  test('Section', () => {
    const json = parseJsx(section);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });

  test('Text', () => {
    const json = parseJsx(text);
    const output = componentToLiquid(json);
    expect(output).toMatchSnapshot();
  });
});
