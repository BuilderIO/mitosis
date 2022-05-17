import { componentToAngular } from '../generators/angular';
import { parseJsx } from '../parsers/jsx';

const multipleOnUpdate = require('./data/blocks/multiple-onUpdate.raw');
const onUpdate = require('./data/blocks/onUpdate.raw');
const onMount = require('./data/blocks/onMount.raw');
const onInitonMount = require('./data/blocks/onInit-onMount.raw');
const onInit = require('./data/blocks/onInit.raw');
const basicFor = require('./data/basic-for.raw');
const basicOutputs = require('./data/basic-outputs.raw');
const contentSlotHtml = require('./data/blocks/content-slot-html.raw');
const contentSlotJsx = require('./data/blocks/content-slot-jsx.raw');
const slotJsx = require('./data/blocks/slot-jsx.raw');
const classNameJsx = require('./data/blocks/classname-jsx.raw');
// const slotHtml = require('./data/blocks/slot-html.raw');

describe('Angular', () => {
  test('basic outputs', () => {
    const component = parseJsx(basicOutputs);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });
  test('multiple onUpdate', () => {
    const component = parseJsx(multipleOnUpdate);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onUpdate', () => {
    const component = parseJsx(onUpdate);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onMount', () => {
    const component = parseJsx(onMount);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onInit and onMount', () => {
    const component = parseJsx(onInitonMount);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onInit', () => {
    const component = parseJsx(onInit);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('BasicFor', () => {
    const component = parseJsx(basicFor);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('ng-content and Slot', () => {
    const component = parseJsx(contentSlotHtml);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('ng-content and Slot jsx-props', () => {
    const component = parseJsx(contentSlotJsx);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Slot Jsx', () => {
    const component = parseJsx(slotJsx);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });
  // test('Slot Html', () => {
  //   const component = parseJsx(slotHtml);
  //   const output = componentToAngular()({ component });
  //   expect(output).toMatchSnapshot();
  // });

  test('className to class', () => {
    const component = parseJsx(classNameJsx);
    const output = componentToAngular()({ component });
    expect(output).toMatchSnapshot();
  });
});
