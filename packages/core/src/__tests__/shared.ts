import { BaseTranspilerOptions, TranspilerGenerator } from '../types/transpiler';
import { Target } from '../types/config';
import { parseJsx } from '../parsers/jsx';
import { MitosisComponent, parseSvelte } from '..';

const getRawFile = (path: string) => import(`${path}?raw`).then((x) => x.default as string);

type RawFile = ReturnType<typeof getRawFile>;

const basicForShow = getRawFile('./data/basic-for-show.raw.tsx');
const basicBooleanAttribute = getRawFile('./data/basic-boolean-attribute.raw.tsx');
const basicOnMountUpdate = getRawFile('./data/basic-onMount-update.raw.tsx');
const basicContext = getRawFile('./data/basic-context.raw.tsx');
const basicOutputsMeta = getRawFile('./data/basic-outputs-meta.raw.tsx');
const basicOutputs = getRawFile('./data/basic-outputs.raw.tsx');
const subComponent = getRawFile('./data/sub-component.raw.tsx');
const componentWithContext = getRawFile('./data/context/component-with-context.raw.tsx');

const expressionState = getRawFile('./data/expression-state.raw.tsx');
const contentState = getRawFile('./data/context-state.raw.tsx');

const basic = getRawFile('./data/basic.raw.tsx');
const basicAttribute = getRawFile('./data/basic-attribute.raw.tsx');
const basicMitosis = getRawFile('./data/basic-custom-mitosis-package.raw.tsx');
const basicChildComponent = getRawFile('./data/basic-child-component.raw.tsx');
const basicFor = getRawFile('./data/basic-for.raw.tsx');
const basicRef = getRawFile('./data/basic-ref.raw.tsx');
const basicForwardRef = getRawFile('./data/basic-forwardRef.raw.tsx');
const basicForwardRefMetadata = getRawFile('./data/basic-forwardRef-metadata.raw.tsx');
const basicRefPrevious = getRawFile('./data/basic-ref-usePrevious.raw.tsx');
const basicRefAssignment = getRawFile('./data/basic-ref-assignment.raw.tsx');
const propsDestructure = getRawFile('./data/basic-props-destructure.raw.tsx');
const nestedStyles = getRawFile('./data/nested-styles.raw.tsx');
const preserveExportOrLocalStatement = getRawFile(
  './data/basic-preserve-export-or-local-statement.raw.tsx',
);
const arrowFunctionInUseStore = getRawFile('./data/arrow-function-in-use-store.raw.tsx');

const propsType = getRawFile('./data/types/component-props-type.raw.tsx');
const propsInterface = getRawFile('./data/types/component-props-interface.raw.tsx');
const preserveTyping = getRawFile('./data/types/preserve-typing.raw.tsx');
const typeDependency = getRawFile('./data/types/type-dependency.raw.tsx');

const defaultProps = getRawFile('./data/default-props/default-props.raw.tsx');
const defaultPropsOutsideComponent = getRawFile(
  './data/default-props/default-props-outside-component.raw.tsx',
);

const classRaw = getRawFile('./data/styles/class.raw.tsx');
const className = getRawFile('./data/styles/className.raw.tsx');
const classAndClassName = getRawFile('./data/styles/class-and-className.raw.tsx');
const classState = getRawFile('./data/styles/classState.raw.tsx');
const useStyle = getRawFile('./data/styles/use-style.raw.tsx');
const useStyleOutsideComponent = getRawFile('./data/styles/use-style-outside-component.raw.tsx');
const useStyleAndCss = getRawFile('./data/styles/use-style-and-css.raw.tsx');

const button = getRawFile('./data/blocks/button.raw.tsx');
const classNameJsx = getRawFile('./data/blocks/classname-jsx.raw.tsx');
const columns = getRawFile('./data/blocks/columns.raw.tsx');
const contentSlotHtml = getRawFile('./data/blocks/content-slot-html.raw.tsx');
const contentSlotJsx = getRawFile('./data/blocks/content-slot-jsx.raw.tsx');
const customCode = getRawFile('./data/blocks/custom-code.raw.tsx');
const formBlock = getRawFile('./data/blocks/form.raw.tsx');
const image = getRawFile('./data/blocks/image.raw.tsx');
const imageState = getRawFile('./data/blocks/img-state.raw.tsx');
const img = getRawFile('./data/blocks/img.raw.tsx');
const inputBlock = getRawFile('./data/blocks/input.raw.tsx');
const multipleOnUpdate = getRawFile('./data/blocks/multiple-onUpdate.raw.tsx');
const multipleOnUpdateWithDeps = getRawFile('./data/blocks/multiple-onUpdateWithDeps.raw.tsx');
const onInit = getRawFile('./data/blocks/onInit.raw.tsx');
const onInitonMount = getRawFile('./data/blocks/onInit-onMount.raw.tsx');
const onMount = getRawFile('./data/blocks/onMount.raw.tsx');
const onUpdate = getRawFile('./data/blocks/onUpdate.raw.tsx');
const onUpdateWithDeps = getRawFile('./data/blocks/onUpdateWithDeps.raw.tsx');
const rawText = getRawFile('./data/blocks/raw-text.raw.tsx');
const section = getRawFile('./data/blocks/section.raw.tsx');
const sectionState = getRawFile('./data/blocks/section-state.raw.tsx');
const selectBlock = getRawFile('./data/blocks/select.raw.tsx');
const selfRefCompWChildren = getRawFile(
  './data/blocks/self-referencing-component-with-children.raw.tsx',
);
const selfRefComp = getRawFile('./data/blocks/self-referencing-component.raw.tsx');
const slotHtml = getRawFile('./data/blocks/slot-html.raw.tsx');
const slotJsx = getRawFile('./data/blocks/slot-jsx.raw.tsx');
const stamped = getRawFile('./data/blocks/stamped-io.raw.tsx');
const submitButtonBlock = getRawFile('./data/blocks/submit-button.raw.tsx');
const text = getRawFile('./data/blocks/text.raw.tsx');
const textarea = getRawFile('./data/blocks/textarea.raw.tsx');
const video = getRawFile('./data/blocks/video.raw.tsx');

const multipleSpreads = getRawFile('./data/spread/multiple-spreads.raw.tsx');
const spreadAttrs = getRawFile('./data/spread/spread-attrs.raw.tsx');
const spreadNestedProps = getRawFile('./data/spread/spread-nested-props.raw.tsx');
const spreadProps = getRawFile('./data/spread/spread-props.raw.tsx');

const builderRenderContent = getRawFile('./data/blocks/builder-render-content.raw.tsx');

const rootFragmentMultiNode = getRawFile('./data/blocks/root-fragment-multi-node.raw.tsx');
const renderContentExample = getRawFile('./data/render-content.raw.tsx');

const path = 'test-path';

type Tests = { [index: string]: RawFile };

const SVELTE_SYNTAX_TESTS: Tests = {
  basic: getRawFile('./syntax/svelte/basic.raw.svelte'),
  bindGroup: getRawFile('./syntax/svelte/bind-group.raw.svelte'),
  bindProperty: getRawFile('./syntax/svelte/bind-property.raw.svelte'),
  classDirective: getRawFile('./syntax/svelte/class-directive.raw.svelte'),
  context: getRawFile('./syntax/svelte/context.raw.svelte'),
  each: getRawFile('./syntax/svelte/each.raw.svelte'),
  html: getRawFile('./syntax/svelte/html.raw.svelte'),
  eventHandlers: getRawFile('./syntax/svelte/event-handlers.raw.svelte'),
  ifElse: getRawFile('./syntax/svelte/if-else.raw.svelte'),
  imports: getRawFile('./syntax/svelte/imports.raw.svelte'),
  lifecycleHooks: getRawFile('./syntax/svelte/lifecycle-hooks.raw.svelte'),
  reactive: getRawFile('./syntax/svelte/reactive.raw.svelte'),
  reactiveWithFn: getRawFile('./syntax/svelte/reactive-with-fn.raw.svelte'),
  style: getRawFile('./syntax/svelte/style.raw.svelte'),
  textExpressions: getRawFile('./syntax/svelte/text-expressions.raw.svelte'),
};

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
  defaultValsWithTypes: getRawFile('./data/types/component-with-default-values-types.raw.tsx'),
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
  renderContentExample,
  arrowFunctionInUseStore,
  expressionState,
  contentState,
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
  rootShow: getRawFile('./data/blocks/rootShow.raw.tsx'),
  nestedShow: getRawFile('./data/show/nested-show.raw.tsx'),
  showWithFor: getRawFile('./data/show/show-with-for.raw.tsx'),
};

const ADVANCED_REF: Tests = {
  AdvancedRef: getRawFile('./data/advanced-ref.raw.tsx'),
};

const ON_UPDATE_RETURN: Tests = {
  basicOnUpdateReturn: getRawFile('./data/basic-onUpdate-return.raw.tsx'),
};

const IMPORT_TEST: Tests = {
  importRaw: getRawFile('./data/import.raw.tsx'),
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

const JSX_TESTS_FOR_TARGET: Partial<Record<Target, Tests[]>> = {
  alpine: [
    CONTEXT_TEST,
    BASIC_TESTS,
    SLOTS_TESTS, // Slots not implemented
    SHOW_TESTS,
    FORWARD_REF_TESTS,
    MULTI_ON_UPDATE_TESTS,
    FORM_BLOCK_TESTS,
    FOR_SHOW_TESTS,
    ADVANCED_REF,
    ON_UPDATE_RETURN,
  ],
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
  test('Remove Internal mitosis package', async () => {
    const component = parseJsx(await basicMitosis, {
      compileAwayPackages: ['@dummy/custom-mitosis'],
    });
    expect(component).toMatchSnapshot();
  });

  JSX_TESTS.forEach((tests) => {
    Object.keys(tests).forEach((key) => {
      test(key, async () => {
        const component = parseJsx(await tests[key]);
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
  const configurations: { options: X; testName: string }[] = [
    { options: { ...options, typescript: false }, testName: 'Javascript Test' },
    { options: { ...options, typescript: true }, testName: 'Typescript Test' },
  ];

  type ParserConfig = {
    name: 'jsx' | 'svelte';
    parser: (code: string) => Promise<MitosisComponent>;
    testsArray?: Tests[];
  };

  const parsers: ParserConfig[] = [
    {
      name: 'jsx',
      parser: async (x) => parseJsx(x, { typescript: options.typescript }),
      testsArray: JSX_TESTS_FOR_TARGET[target],
    },
    {
      name: 'svelte',
      parser: async (x) => parseSvelte(x),
      testsArray: [SVELTE_SYNTAX_TESTS],
    },
  ];

  for (const { name, parser, testsArray } of parsers) {
    if (testsArray) {
      describe(name, () => {
        configurations.forEach(({ options, testName }) => {
          if (name === 'jsx' && options.typescript === false) {
            test('Remove Internal mitosis package', async () => {
              const component = parseJsx(await basicMitosis, {
                compileAwayPackages: ['@dummy/custom-mitosis'],
              });
              const output = generator(options)({ component, path });
              expect(output).toMatchSnapshot();
            });
          }
          describe(testName, () => {
            testsArray.forEach((tests) => {
              Object.keys(tests).forEach((key) => {
                test(key, async () => {
                  const component = await parser(await tests[key]);
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
      });
    }
  }
};
