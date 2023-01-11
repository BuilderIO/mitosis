import { replaceIdentifiers } from './replace-identifiers';

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
    to: (name) => {
      console.log({ name });
      return `${name}.value`;
    },
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
