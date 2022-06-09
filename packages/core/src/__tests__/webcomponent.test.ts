import { componentToCustomElement } from '../generators/html';
import { parseJsx } from '../parsers/jsx';

const basic = require('./data/basic.raw');
const basicChildComponent = require('./data/basic-child-component.raw');
const basicFor = require('./data/basic-for.raw');
// const basicOnUpdateReturn = require('./data/basic-onUpdate-return.raw');
const basicOnUpdateDeps = require('./data/basic-onUpdate-deps.raw');
const basicRef = require('./data/basic-ref.raw');
const basicForwardRef = require('./data/basic-forwardRef.raw');
const basicForwardRefMetadata = require('./data/basic-forwardRef-metadata.raw');
const basicRefPrevious = require('./data/basic-ref-usePrevious.raw');
const basicRefAssignment = require('./data/basic-ref-assignment.raw');
const basicContext = require('./data/basic-context.raw');
const basicForShow = require('./data/basic-for-show.raw');
const basicOnMountUpdate = require('./data/basic-onMount-update.raw');
const submitButtonBlock = require('./data/blocks/submit-button.raw');
const inputBlock = require('./data/blocks/input.raw');
const selectBlock = require('./data/blocks/select.raw');
// const formBlock = require('./data/blocks/form.raw');
const button = require('./data/blocks/button.raw');
const textarea = require('./data/blocks/textarea.raw');
const img = require('./data/blocks/img.raw');
const video = require('./data/blocks/video.raw');
const section = require('./data/blocks/section.raw');
const sectionState = require('./data/blocks/section-state.raw');
const text = require('./data/blocks/text.raw');

const image = require('./data/blocks/image.raw');
const imageState = require('./data/blocks/img-state.raw');
const columns = require('./data/blocks/columns.raw');
const onUpdate = require('./data/blocks/onUpdate.raw');
const onUpdateWithDeps = require('./data/blocks/onUpdateWithDeps.raw');
const multipleOnUpdate = require('./data/blocks/multiple-onUpdate.raw');
const multipleOnUpdateWithDeps = require('./data/blocks/multiple-onUpdateWithDeps.raw');
const onMount = require('./data/blocks/onMount.raw');
const onInit = require('./data/blocks/onInit.raw');
const onInitonMount = require('./data/blocks/onInit-onMount.raw');

const stamped = require('./data/blocks/stamped-io.raw');
const shadowDom = require('./data/blocks/shadow-dom.raw');
describe('webcomponent', () => {
  test('Basic', () => {
    const component = parseJsx(basic);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Basic Ref', () => {
    const component = parseJsx(basicRef);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Basic ForwardRef', () => {
    const component = parseJsx(basicForwardRef);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Basic ForwardRef same as meta', () => {
    const component = parseJsx(basicForwardRef);
    const componentMeta = parseJsx(basicForwardRefMetadata);
    const output = componentToCustomElement()({ component });
    const outputMeta = componentToCustomElement()({ component: componentMeta });
    expect(output).toMatch(outputMeta);
  });

  test('Basic Ref Assignment', () => {
    const component = parseJsx(basicRefAssignment);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Basic Ref Previous', () => {
    const component = parseJsx(basicRefPrevious);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  // test('Basic onUpdate return', () => {
  //   const component = parseJsx(basicOnUpdateReturn);
  //   const output = componentToCustomElement()({ component });
  //   expect(output).toMatchSnapshot();
  // });

  test('Basic onUpdate deps', () => {
    const component = parseJsx(basicOnUpdateDeps);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Basic Context', () => {
    const component = parseJsx(basicContext);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Basic Child Component', () => {
    const component = parseJsx(basicChildComponent);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('BasicFor', () => {
    const component = parseJsx(basicFor);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('BasicForShow', () => {
    const component = parseJsx(basicForShow);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('BasicOnMountUpdate', () => {
    const component = parseJsx(basicOnMountUpdate);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Input block', () => {
    const component = parseJsx(inputBlock);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Submit button block', () => {
    const component = parseJsx(submitButtonBlock);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Select block', () => {
    const component = parseJsx(selectBlock);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  // test('Form block', () => {
  //   const component = parseJsx(formBlock);
  //   const output = componentToCustomElement()({ component });
  //   expect(output).toMatchSnapshot();
  // });

  test('Button', () => {
    const component = parseJsx(button);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Textarea', () => {
    const component = parseJsx(textarea);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Img', () => {
    const component = parseJsx(img);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Video', () => {
    const component = parseJsx(video);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Section', () => {
    const component = parseJsx(section);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('SectionState', () => {
    const component = parseJsx(sectionState);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Text', () => {
    const component = parseJsx(text);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Image', () => {
    const component = parseJsx(image);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('ImageState', () => {
    const component = parseJsx(imageState);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Columns', () => {
    const component = parseJsx(columns);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onUpdate', () => {
    const component = parseJsx(onUpdate);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onUpdateWithDeps', () => {
    const component = parseJsx(onUpdateWithDeps);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('multipleOnUpdate', () => {
    const component = parseJsx(multipleOnUpdate);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('multipleOnnUpdateWithDeps', () => {
    const component = parseJsx(multipleOnUpdateWithDeps);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onMount & onUnMount', () => {
    const component = parseJsx(onMount);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onInit', () => {
    const component = parseJsx(onInit);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('onInit & onMount', () => {
    const component = parseJsx(onInitonMount);
    const output = componentToCustomElement()({ component });
    expect(output).toMatchSnapshot();
  });

  test('Stamped', () => {
    const component = parseJsx(stamped);
    const html = componentToCustomElement()({ component });
    expect(html).toMatchSnapshot();
  });

  test('Shadow DOM', () => {
    const component = parseJsx(shadowDom);
    const html = componentToCustomElement()({ component });
    expect(html).toMatchSnapshot();
  });
});
