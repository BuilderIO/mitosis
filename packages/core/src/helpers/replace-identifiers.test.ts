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
    to: undefined,
    code: CODE_BLOCK,
  },
  {
    from: ['props', 'state'],
    to: 'this',
    code: CODE_BLOCK,
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
