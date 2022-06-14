import { Transpiler } from '..';
import { componentToReact } from '../generators/react';
import { parseJsx } from '../parsers/jsx';

const onInitonMount = require('./data/blocks/onInit-onMount.raw');
const basicContext = require('./data/basic-context.raw');
const basicOutputsMeta = require('./data/basic-outputs-meta.raw');
const basicOutputs = require('./data/basic-outputs.raw');
const classNameJsx = require('./data/blocks/classname-jsx.raw');

const basic = require('./data/basic.raw');
const basicMitosis = require('./data/basic-custom-mitosis-package.raw');
const basicChildComponent = require('./data/basic-child-component.raw');
const basicFor = require('./data/basic-for.raw');
const basicRef = require('./data/basic-ref.raw');
const basicForwardRef = require('./data/basic-forwardRef.raw');
const basicForwardRefMetadata = require('./data/basic-forwardRef-metadata.raw');
const basicRefPrevious = require('./data/basic-ref-usePrevious.raw');
const basicRefAssignment = require('./data/basic-ref-assignment.raw');
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
const image = require('./data/blocks/image.raw');
const columns = require('./data/blocks/columns.raw');
const onUpdate = require('./data/blocks/onUpdate.raw');
const onInit = require('./data/blocks/onInit.raw');
const onUpdateWithDeps = require('./data/blocks/onUpdateWithDeps.raw');
const multipleOnUpdate = require('./data/blocks/multiple-onUpdate.raw');
const multipleOnUpdateWithDeps = require('./data/blocks/multiple-onUpdateWithDeps.raw');
const onMount = require('./data/blocks/onMount.raw');
const rootShow = require('./data/blocks/rootShow.raw');
const contentSlotHtml = require('./data/blocks/content-slot-html.raw');
const contentSlotJsx = require('./data/blocks/content-slot-jsx.raw');
const slotJsx = require('./data/blocks/slot-jsx.raw');
const slotHtml = require('./data/blocks/slot-html.raw');
const propsType = require('./data/types/component-props-type.raw');
const propsInterface = require('./data/types/component-props-interface.raw');
const preserveTyping = require('./data/types/preserve-typing.raw');
const propsDestructure = require('./data/basic-props-destructure.raw');

const path = 'test-path';
export const getTestsForGenerator = (generator: Transpiler) => {
  test('Remove Internal mitosis package', () => {
    const component = parseJsx(basicMitosis, {
      compileAwayPackages: ['@dummy/custom-mitosis'],
    });
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('ContentSlotJSX', () => {
    const component = parseJsx(contentSlotJsx);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
  test('ContentSlotHtml', () => {
    const component = parseJsx(contentSlotHtml);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
  test('SlotJsx', () => {
    const component = parseJsx(slotJsx);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
  test('SlotHtml', () => {
    const component = parseJsx(slotHtml);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
  test('Basic', () => {
    const component = parseJsx(basic);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Basic Ref', () => {
    const component = parseJsx(basicRef);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Basic ForwardRef', () => {
    const component = parseJsx(basicForwardRef);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Basic ForwardRef same as meta', () => {
    const component = parseJsx(basicForwardRef);
    const componentMeta = parseJsx(basicForwardRefMetadata);
    const output = generator({ component, path });
    const outputMeta = generator({ component: componentMeta, path });
    expect(output).toMatch(outputMeta);
  });

  test('Basic Ref Previous', () => {
    const component = parseJsx(basicRefPrevious);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Basic Ref Assignment', () => {
    const component = parseJsx(basicRefAssignment);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Basic Child Component', () => {
    const component = parseJsx(basicChildComponent);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('BasicFor', () => {
    const component = parseJsx(basicFor);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Input block', () => {
    const component = parseJsx(inputBlock);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Submit button block', () => {
    const component = parseJsx(submitButtonBlock);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Select block', () => {
    const component = parseJsx(selectBlock);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Form block', () => {
    const component = parseJsx(formBlock);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Button', () => {
    const component = parseJsx(button);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Textarea', () => {
    const component = parseJsx(textarea);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Img', () => {
    const component = parseJsx(img);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Video', () => {
    const component = parseJsx(video);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Section', () => {
    const component = parseJsx(section);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Text', () => {
    const component = parseJsx(text);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('RawText', () => {
    const component = parseJsx(rawText);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Stamped.io', () => {
    const component = parseJsx(stamped);
    const output = componentToReact({
      stylesType: 'styled-components',
      stateType: 'useState',
    })({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('CustomCode', () => {
    const component = parseJsx(customCode);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Embed', () => {
    const component = parseJsx(customCode);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Image', () => {
    const component = parseJsx(image);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('Columns', () => {
    const component = parseJsx(columns);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('onUpdate', () => {
    const component = parseJsx(onUpdate);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('onInit', () => {
    const component = parseJsx(onInit);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('onUpdateWithDeps', () => {
    const component = parseJsx(onUpdateWithDeps);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('onMount & onUnMount', () => {
    const component = parseJsx(onMount);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('rootShow', () => {
    const component = parseJsx(rootShow);
    const output = componentToReact({ prettier: false })({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('propsType', () => {
    const component = parseJsx(propsType);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('propsInterface', () => {
    const component = parseJsx(propsInterface);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('preserveTyping', () => {
    const component = parseJsx(preserveTyping);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('propsDestructure', () => {
    const component = parseJsx(propsDestructure);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('onInit and onMount', () => {
    const component = parseJsx(onInitonMount);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
  test('Basic Context', () => {
    const component = parseJsx(basicContext);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
  test('Basic Outputs Meta', () => {
    const component = parseJsx(basicOutputsMeta);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
  test('Basic Outputs', () => {
    const component = parseJsx(basicOutputs);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
  test('className to class', () => {
    const component = parseJsx(classNameJsx);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
};

export const getMultipleOnUpdateTests = (generator: Transpiler) => {
  test('multipleOnUpdate', () => {
    const component = parseJsx(multipleOnUpdate);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  test('multipleOnUpdateWithDeps', () => {
    const component = parseJsx(multipleOnUpdateWithDeps);
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });
};
