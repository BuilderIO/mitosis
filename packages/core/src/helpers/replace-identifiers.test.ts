import { types } from '@babel/core';
import { replaceIdentifiers, replaceNodes } from './replace-identifiers';

type Spec = Parameters<typeof replaceIdentifiers>[0];

const CODE_BLOCK = `
function updateThing() {
  state.thing1 = props.thing2 + 123;

  state?.fn(props?.abc.foo);

  const x = someRandomObj.state.foo
  const y = someRandomObj.props.state.foo
}
`;

const TEST_SPECS: Spec[] = [
  {
    from: 'props',
    to: '$SPECIAL',
    code: CODE_BLOCK,
  },
  {
    from: ['props', 'state'],
    to: null,
    code: CODE_BLOCK,
  },
  {
    from: ['props', 'state'],
    to: 'this',
    code: CODE_BLOCK,
  },
  {
    code: '!state.useLazyLoading() || load',
    from: ['scrollListener', 'imageLoaded', 'setLoaded', 'useLazyLoading', 'isBrowser', 'load'],
    to: (name) => `state.${name}`,
  },
  {
    code: `state.name = 'PatrickJS onInit' + props.hi;`,
    from: ['props'],
    to: (name) => `this.${name}`,
  },
  {
    code: 'state.lowerCaseName()',
    from: 'state',
    to: (name) => (name === 'children' ? '$$slots.default' : name),
  },
  {
    code: `
    const x = {
      foo: bar,
      test: 123,
    }

    const foo = x.foo;

    const y = {
      l: x.foo,
      m: foo
    }

    const bar = foo;
    `,
    from: ['foo', 'test'],
    to: (name) => `${name}.value`,
  },
];

describe('replaceIdentifiers', () => {
  TEST_SPECS.forEach((args, index) => {
    test(`Check #${index}`, () => {
      const output = replaceIdentifiers(args);
      expect(output).toMatchSnapshot();
    });
  });
});

describe('newReplacer', () => {
  test('Check #1', () => {
    const code = `
  const [childrenContext] = useState(
    useTarget({
      reactNative: {
        apiKey: props.context.value.apiKey,
        apiVersion: props.context.value.apiVersion,
        localState: props.context.value.localState,
        rootState: props.context.value.rootState,
        rootSetState: props.context.value.rootSetState,
        content: props.context.value.content,
        context: props.context.value.context,
        registeredComponents: props.context.value.registeredComponents,
        inheritedStyles: extractTextStyles(
          getReactNativeBlockStyles({
            block: state.useBlock,
            context: props.context.value,
            blockStyles: state.attributes.style,
          })
        ),
      },
      default: props.context.value,
    }),
    { reactive: true }
  );
`;
    const thing = types.memberExpression(
      types.memberExpression(types.identifier('props'), types.identifier('context')),
      types.identifier('value'),
    );

    const to = types.memberExpression(types.identifier('props'), types.identifier('$context'));
    const output = replaceNodes({ code, nodeMaps: [{ from: thing, to }] });
    expect(output).toMatchSnapshot();
  });
});
