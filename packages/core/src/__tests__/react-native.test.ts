import { componentToReactNative } from '../generators/react-native';
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
const rawText = require('./data/blocks/raw-text.raw');
const stamped = require('./data/blocks/stamped-io.raw');
const customCode = require('./data/blocks/custom-code.raw');
const embed = require('./data/blocks/embed.raw');
const image = require('./data/blocks/image.raw');
const columns = require('./data/blocks/columns.raw');

describe('React', () => {
  test('Basic', () => {
    const component = parseJsx(basic);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Input block', () => {
    const component = parseJsx(inputBlock);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Submit button block', () => {
    const component = parseJsx(submitButtonBlock);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Select block', () => {
    const component = parseJsx(selectBlock);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Form block', () => {
    const component = parseJsx(formBlock);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Button', () => {
    const component = parseJsx(button);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Textarea', () => {
    const component = parseJsx(textarea);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Img', () => {
    const component = parseJsx(img);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Video', () => {
    const component = parseJsx(video);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Section', () => {
    const component = parseJsx(section);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Text', () => {
    const component = parseJsx(text);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('RawText', () => {
    const component = parseJsx(rawText);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Stamped.io', () => {
    const component = parseJsx(stamped);
    const output = componentToReactNative({
      stateType: 'useState',
    })({ component });
    expect(output).toMatchSnapshot();
  });

  test('CustomCode', () => {
    const component = parseJsx(customCode);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Embed', () => {
    const component = parseJsx(customCode);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Image', () => {
    const component = parseJsx(image);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Columns', () => {
    const component = parseJsx(columns);
    const output = componentToReactNative()({ component });
    expect(output).toMatchSnapshot();
  });
});
