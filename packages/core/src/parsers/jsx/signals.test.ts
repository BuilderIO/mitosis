import { mapSignalType } from '../../helpers/signals';
import { createTypescriptProject } from '../../helpers/typescript-project';
import { findSignals } from './signals';

const code = `
import { Signal, useState, useContext, createContext } from '@builder.io/mitosis';

const FooContext = createContext({ foo: 'bar' }, { reactive: true });
const NormalContext = createContext({ foo: 'bar' });

type K = Signal<string>;

type Props = {
  k: K;
  another: Signal<number>
};
    
export default function MyComponent(props: Props) {
  const [n] = useState(123, { reactive: true });

  const context = useContext(FooContext)
  const normalContext = useContext(NormalContext)

  console.log(
    n, 
    n.value, 
    props.k, 
    props.k.value,
    context,
    context.value.foo,
    normalContext,
    normalContext.value.foo,
    );

  return <RenderBlock 
    a={props.k} 
    b={props.k.value} 
    c={n} 
    d={n.value} 
    e={context}
    f={context.value.foo}
    g={normalContext}
    h={normalContext.value.foo}
    />;
};
`;
describe('Signals type parsing', () => {
  // we piggyback on the e2e-app TS project to avoid having to setup one for this test.
  const tsProject = createTypescriptProject(__dirname + '/../../../tsconfig.json');

  test(findSignals.name, () => {
    const result = findSignals({ code, ...tsProject });
    expect(result).toMatchSnapshot();
  });

  describe(mapSignalType.name, () => {
    test('svelte', () => {
      const result = mapSignalType({ target: 'svelte', code, ...tsProject });
      expect(result).toMatchSnapshot();
    });

    test('react', () => {
      const result = mapSignalType({ target: 'react', code, ...tsProject });
      expect(result).toMatchSnapshot();
    });
  });
});
