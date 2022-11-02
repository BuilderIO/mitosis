import { BaseTranspilerOptions, TranspilerGenerator } from '../types/transpiler';
import { Target } from '../types/config';
import { parseJsx } from '../parsers/jsx';

const getRawFile = (path: string): string => require(path);

const basicForShow = getRawFile('./data/basic-for-show.raw');
const basicBooleanAttribute = getRawFile('./data/basic-boolean-attribute.raw');
const basicOnMountUpdate = getRawFile('./data/basic-onMount-update.raw');
const basicContext = getRawFile('./data/basic-context.raw');
const basicOutputsMeta = getRawFile('./data/basic-outputs-meta.raw');
const basicOutputs = getRawFile('./data/basic-outputs.raw');
const subComponent = getRawFile('./data/sub-component.lite.jsx');
const componentWithContext = require('./data/context/component-with-context.lite');

const basic = getRawFile('./data/basic.raw');
const basicAttribute = getRawFile('./data/basic-attribute.raw.tsx');
const basicMitosis = getRawFile('./data/basic-custom-mitosis-package.raw');
const basicChildComponent = getRawFile('./data/basic-child-component.raw');
const basicFor = getRawFile('./data/basic-for.raw');
const basicRef = getRawFile('./data/basic-ref.raw');
const basicForwardRef = getRawFile('./data/basic-forwardRef.raw');
const basicForwardRefMetadata = getRawFile('./data/basic-forwardRef-metadata.raw');
const basicRefPrevious = getRawFile('./data/basic-ref-usePrevious.raw');
const basicRefAssignment = getRawFile('./data/basic-ref-assignment.raw');
const propsDestructure = getRawFile('./data/basic-props-destructure.raw');
const nestedStyles = getRawFile('./data/nested-styles.lite');
const preserveExportOrLocalStatement = getRawFile(
  './data/basic-preserve-export-or-local-statement.raw',
);

const propsType = getRawFile('./data/types/component-props-type.raw');
const propsInterface = getRawFile('./data/types/component-props-interface.raw');
const preserveTyping = getRawFile('./data/types/preserve-typing.raw');
const typeDependency = getRawFile('./data/types/type-dependency.raw');

const defaultProps = getRawFile('./data/default-props/default-props.raw');
const defaultPropsOutsideComponent = getRawFile(
  './data/default-props/default-props-outside-component.raw',
);

const classRaw = getRawFile('./data/styles/class.raw');
const className = getRawFile('./data/styles/className.raw');
const classAndClassName = getRawFile('./data/styles/class-and-className.raw');
const classState = getRawFile('./data/styles/classState.raw');
const useStyle = getRawFile('./data/styles/use-style.raw');
const useStyleOutsideComponent = getRawFile('./data/styles/use-style-outside-component.raw');
const useStyleAndCss = getRawFile('./data/styles/use-style-and-css.raw');

const button = getRawFile('./data/blocks/button.raw');
const classNameJsx = getRawFile('./data/blocks/classname-jsx.raw');
const columns = getRawFile('./data/blocks/columns.raw');
const contentSlotHtml = getRawFile('./data/blocks/content-slot-html.raw');
const contentSlotJsx = getRawFile('./data/blocks/content-slot-jsx.raw');
const customCode = getRawFile('./data/blocks/custom-code.raw');
const formBlock = getRawFile('./data/blocks/form.raw');
const image = getRawFile('./data/blocks/image.raw');
const imageState = getRawFile('./data/blocks/img-state.raw');
const img = getRawFile('./data/blocks/img.raw');
const inputBlock = getRawFile('./data/blocks/input.raw');
const multipleOnUpdate = getRawFile('./data/blocks/multiple-onUpdate.raw');
const multipleOnUpdateWithDeps = getRawFile('./data/blocks/multiple-onUpdateWithDeps.raw');
const onInit = getRawFile('./data/blocks/onInit.raw');
const onInitonMount = getRawFile('./data/blocks/onInit-onMount.raw');
const onMount = getRawFile('./data/blocks/onMount.raw');
const onUpdate = getRawFile('./data/blocks/onUpdate.raw');
const onUpdateWithDeps = getRawFile('./data/blocks/onUpdateWithDeps.raw');
const rawText = getRawFile('./data/blocks/raw-text.raw');
const section = getRawFile('./data/blocks/section.raw');
const sectionState = getRawFile('./data/blocks/section-state.raw');
const selectBlock = getRawFile('./data/blocks/select.raw');
const selfRefCompWChildren = getRawFile(
  './data/blocks/self-referencing-component-with-children.raw',
);
const selfRefComp = getRawFile('./data/blocks/self-referencing-component.raw');
const slotHtml = getRawFile('./data/blocks/slot-html.raw');
const slotJsx = getRawFile('./data/blocks/slot-jsx.raw');
const stamped = getRawFile('./data/blocks/stamped-io.raw');
const submitButtonBlock = getRawFile('./data/blocks/submit-button.raw');
const text = getRawFile('./data/blocks/text.raw');
const textarea = getRawFile('./data/blocks/textarea.raw');
const video = getRawFile('./data/blocks/video.raw');

const multipleSpreads = getRawFile('./data/spread/multiple-spreads.raw');
const spreadAttrs = getRawFile('./data/spread/spread-attrs.raw');
const spreadNestedProps = getRawFile('./data/spread/spread-nested-props.raw');
const spreadProps = getRawFile('./data/spread/spread-props.raw');

const builderRenderContent = getRawFile('./data/blocks/builder-render-content.raw');

const rootFragmentMultiNode = getRawFile('./data/blocks/root-fragment-multi-node.raw');
const renderContentExample = getRawFile('./data/render-content.raw');

const path = 'test-path';

type Tests = { [index: string]: string };

const BASIC_TESTS: Tests = {
  Basic: basic,
  BasicAttribute: basicAttribute,
  BasicBooleanAttribute: basicBooleanAttribute,
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
  defaultProps: defaultProps,
  defaultPropsOutsideComponent,
  preserveTyping: preserveTyping,
  typeDependency,
  defaultValsWithTypes: getRawFile('./data/types/component-with-default-values-types.raw'),
  'import types': builderRenderContent,
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
  'use-style': useStyle,
  'use-style-and-css': useStyleAndCss,
  'use-style-outside-component': useStyleOutsideComponent,
  'self-referencing component with children': selfRefCompWChildren,
  'self-referencing component': selfRefComp,
  rootFragmentMultiNode,
  multipleSpreads,
  spreadAttrs,
  spreadNestedProps,
  spreadProps,
  // renderContentExample,
};

const SLOTS_TESTS: Tests = {
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
  rootShow: getRawFile('./data/blocks/rootShow.raw'),
  nestedShow: getRawFile('./data/show/nested-show.raw'),
  showWithFor: getRawFile('./data/show/show-with-for.raw'),
};

const ADVANCED_REF: Tests = {
  AdvancedRef: getRawFile('./data/advanced-ref.raw'),
};

const ON_UPDATE_RETURN: Tests = {
  basicOnUpdateReturn: getRawFile('./data/basic-onUpdate-return.raw'),
};

const IMPORT_TEST: Tests = {
  importRaw: getRawFile('./data/import.raw'),
};

const CONTEXT_TEST: Tests = {
  componentWithContext,
};

const JSX_TESTS: Tests[] = [
  BASIC_TESTS,
  SLOTS_TESTS,
  SHOW_TESTS,
  FORWARD_REF_TESTS,
  MULTI_ON_UPDATE_TESTS,
  FORM_BLOCK_TESTS,
  ADVANCED_REF,
  ON_UPDATE_RETURN,
  FOR_SHOW_TESTS,
  CONTEXT_TEST,
];

const TESTS_FOR_TARGET: Partial<Record<Target, Tests[]>> = {
  react: [
    CONTEXT_TEST,
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
  rsc: [
    CONTEXT_TEST,
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
    CONTEXT_TEST,
    BASIC_TESTS,
    SLOTS_TESTS,
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
    IMPORT_TEST,
  ],
  lit: [
    CONTEXT_TEST,
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
    CONTEXT_TEST,
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
    CONTEXT_TEST,
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
    CONTEXT_TEST,
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
    CONTEXT_TEST,
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
    CONTEXT_TEST,
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
    CONTEXT_TEST,
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
    CONTEXT_TEST,
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
    CONTEXT_TEST,
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
    CONTEXT_TEST,
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

export const runTestsForJsx = () => {
  test('Remove Internal mitosis package', () => {
    const component = parseJsx(basicMitosis, {
      compileAwayPackages: ['@dummy/custom-mitosis'],
    });
    expect(component).toMatchSnapshot();
  });

  JSX_TESTS.forEach((tests) => {
    Object.keys(tests).forEach((key) => {
      test(key, () => {
        const component = parseJsx(tests[key]);
        expect(component).toMatchSnapshot();
      });
    });
  });
};

export const runTestsForTarget = <X extends BaseTranspilerOptions>({
  target,
  generator,
  options,
}: {
  target: Target;
  generator: TranspilerGenerator<X>;
  options: X;
}) => {
  const testsArray = TESTS_FOR_TARGET[target];

  test('Remove Internal mitosis package', () => {
    const component = parseJsx(basicMitosis, {
      compileAwayPackages: ['@dummy/custom-mitosis'],
    });
    const output = generator(options)({ component, path });
    expect(output).toMatchSnapshot();
  });

  const configurations: { options: X; testName: string }[] = [
    { options: { ...options, typescript: false }, testName: 'Javascript Test' },
    { options: { ...options, typescript: true }, testName: 'Typescript Test' },
  ];

  if (testsArray) {
    configurations.forEach(({ options, testName }) => {
      describe(testName, () => {
        testsArray.forEach((tests) => {
          Object.keys(tests).forEach((key) => {
            test(key, () => {
              const component = parseJsx(tests[key], { typescript: options.typescript });
              const getOutput = () => generator(options)({ component, path });
              try {
                expect(getOutput()).toMatchSnapshot();
              } catch (error) {
                expect(getOutput).toThrowErrorMatchingSnapshot();
              }
            });
          });
        });
      });
    });
  }
};
