import { Transpiler } from '../types/transpiler';
import { Target } from '../types/config';
import { parseJsx } from '../parsers/jsx';

const basicForShow = require('./data/basic-for-show.raw');
const basicOnMountUpdate = require('./data/basic-onMount-update.raw');
const basicContext = require('./data/basic-context.raw');
const basicOutputsMeta = require('./data/basic-outputs-meta.raw');
const basicOutputs = require('./data/basic-outputs.raw');
const subComponent = require('./data/sub-component.lite.jsx');

const basic = require('./data/basic.raw');
const basicMitosis = require('./data/basic-custom-mitosis-package.raw');
const basicChildComponent = require('./data/basic-child-component.raw');
const basicFor = require('./data/basic-for.raw');
const basicRef = require('./data/basic-ref.raw');
const basicForwardRef = require('./data/basic-forwardRef.raw');
const basicForwardRefMetadata = require('./data/basic-forwardRef-metadata.raw');
const basicRefPrevious = require('./data/basic-ref-usePrevious.raw');
const basicRefAssignment = require('./data/basic-ref-assignment.raw');
const propsDestructure = require('./data/basic-props-destructure.raw');
const nestedStyles = require('./data/nested-styles.lite');
const preserveExportOrLocalStatement = require('./data/basic-preserve-export-or-local-statement.raw');

const propsType = require('./data/types/component-props-type.raw');
const propsInterface = require('./data/types/component-props-interface.raw');
const preserveTyping = require('./data/types/preserve-typing.raw');
const typeDependency = require('./data/types/type-dependency.raw');

const classRaw = require('./data/styles/class.raw');
const className = require('./data/styles/className.raw');
const classAndClassName = require('./data/styles/class-and-className.raw');
const classState = require('./data/styles/classState.raw');

const button = require('./data/blocks/button.raw');
const classNameJsx = require('./data/blocks/classname-jsx.raw');
const columns = require('./data/blocks/columns.raw');
const contentSlotHtml = require('./data/blocks/content-slot-html.raw');
const contentSlotJsx = require('./data/blocks/content-slot-jsx.raw');
const customCode = require('./data/blocks/custom-code.raw');
const formBlock = require('./data/blocks/form.raw');
const image = require('./data/blocks/image.raw');
const imageState = require('./data/blocks/img-state.raw');
const img = require('./data/blocks/img.raw');
const inputBlock = require('./data/blocks/input.raw');
const multipleOnUpdate = require('./data/blocks/multiple-onUpdate.raw');
const multipleOnUpdateWithDeps = require('./data/blocks/multiple-onUpdateWithDeps.raw');
const onInit = require('./data/blocks/onInit.raw');
const onInitonMount = require('./data/blocks/onInit-onMount.raw');
const onMount = require('./data/blocks/onMount.raw');
const onUpdate = require('./data/blocks/onUpdate.raw');
const onUpdateWithDeps = require('./data/blocks/onUpdateWithDeps.raw');
const rawText = require('./data/blocks/raw-text.raw');
const section = require('./data/blocks/section.raw');
const sectionState = require('./data/blocks/section-state.raw');
const selectBlock = require('./data/blocks/select.raw');
const selfRefCompWChildren = require('./data/blocks/self-referencing-component-with-children.raw');
const selfRefComp = require('./data/blocks/self-referencing-component.raw');
const slotHtml = require('./data/blocks/slot-html.raw');
const slotJsx = require('./data/blocks/slot-jsx.raw');
const stamped = require('./data/blocks/stamped-io.raw');
const submitButtonBlock = require('./data/blocks/submit-button.raw');
const text = require('./data/blocks/text.raw');
const textarea = require('./data/blocks/textarea.raw');
const video = require('./data/blocks/video.raw');

const path = 'test-path';

type Tests = { [index: string]: any };

const BASIC_TESTS = {
  Basic: basic,
  BasicRef: basicRef,
  BasicRefPrevious: basicRefPrevious,
  BasicRefAssignment: basicRefAssignment,
  BasicChildComponent: basicChildComponent,
  BasicFor: basicFor,
  Input: inputBlock,
  Submit: submitButtonBlock,
  Select: selectBlock,
  Button: button,
  Textarea: textarea,
  Img: img,
  Video: video,
  Section: section,
  Text: text,
  RawText: rawText,
  'Stamped.io': stamped,
  CustomCode: customCode,
  Embed: customCode,
  Image: image,
  Columns: columns,
  onUpdate: onUpdate,
  onInit: onInit,
  onUpdateWithDeps: onUpdateWithDeps,
  onMount: onMount,
  propsType: propsType,
  propsInterface: propsInterface,
  preserveTyping: preserveTyping,
  typeDependency,
  subComponent,
  nestedStyles,
  propsDestructure: propsDestructure,
  'onInit & onMount': onInitonMount,
  'Basic Context': basicContext,
  'Basic Outputs Meta': basicOutputsMeta,
  'Basic Outputs': basicOutputs,
  className: classNameJsx,
  'Image State': imageState,
  'Basic OnMount Update': basicOnMountUpdate,
  preserveExportOrLocalStatement,
  'class + css': classRaw,
  'className + css': className,
  'class + ClassName + css': classAndClassName,
  'self-referencing component with children': selfRefCompWChildren,
  'self-referencing component': selfRefComp,
};

const SLOTS_TESTS = {
  ContentSlotJSX: contentSlotJsx,
  ContentSlotHtml: contentSlotHtml,
  SlotJsx: slotJsx,
  SlotHtml: slotHtml,
  classState,
};

const MULTI_ON_UPDATE_TESTS: Tests = {
  multipleOnUpdate: multipleOnUpdate,
  multipleOnUpdateWithDeps: multipleOnUpdateWithDeps,
};

const FORM_BLOCK_TESTS: Tests = {
  Form: formBlock,
};

const FOR_SHOW_TESTS: Tests = {
  Section: sectionState,
  Basic: basicForShow,
};

const FORWARD_REF_TESTS: Tests = {
  basicForwardRef,
  basicForwardRefMetadata,
};

const SHOW_TESTS: Tests = {
  rootShow: require('./data/blocks/rootShow.raw'),
  nestedShow: require('./data/show/nested-show.raw'),
  showWithFor: require('./data/show/show-with-for.raw'),
};

const ADVANCED_REF: Tests = {
  AdvancedRef: require('./data/advanced-ref.raw'),
};

const ON_UPDATE_RETURN: Tests = {
  basicOnUpdateReturn: require('./data/basic-onUpdate-return.raw'),
};

const TESTS_FOR_TARGET: Partial<Record<Target, Tests[]>> = {
  react: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
    // FOR_SHOW_TESTS,
  ],
  angular: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
  ],
  lit: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
  ],
  marko: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
  ],
  webcomponent: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
    // FORM_BLOCK_TESTS
  ],
  vue: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
  ],
  svelte: [
    BASIC_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
  ],
  html: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
    // FORM_BLOCK_TESTS
  ],
  stencil: [
    BASIC_TESTS,
    SLOTS_TESTS,
    // ROOT_SHOW_TESTS,
    FORWARD_REF_TESTS,
    // MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
    // FOR_SHOW_TESTS
  ],
  solid: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    // FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
  ],
  reactNative: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
    // FOR_SHOW_TESTS,
  ],
  liquid: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
  ],
  qwik: [
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    FOR_SHOW_TESTS,
  ],
};

export const runTestsForTarget = (target: Target, generator: Transpiler) => {
  const testsArray = TESTS_FOR_TARGET[target];

  test('Remove Internal mitosis package', () => {
    const component = parseJsx(basicMitosis, {
      compileAwayPackages: ['@dummy/custom-mitosis'],
    });
    const output = generator({ component, path });
    expect(output).toMatchSnapshot();
  });

  if (testsArray) {
    testsArray.forEach((tests) => {
      Object.keys(tests).forEach((key) => {
        test(key, () => {
          const component = parseJsx(tests[key]);
          const output = generator({ component, path });
          expect(output).toMatchSnapshot();
        });
      });
    });
  }
};
