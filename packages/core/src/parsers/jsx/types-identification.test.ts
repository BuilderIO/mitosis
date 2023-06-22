import { findSignals } from './types-identification';

describe(findSignals.name, () => {
  test('x', () => {
    const code = `
    import { Signal, useState, useContext, createContext } from '@builder.io/mitosis';

    const FooContext = createContext({ foo: 'bar' }, { reactive: true });
    const NormalContext = createContext({ foo: 'bar' });

    type K = Signal<string>;
    
    type Props = {
      k: K;
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
    const result = findSignals({
      code,
      // we piggyback on the e2e-app TS project to avoid having to setup one for this test.
      tsConfigFilePath: __dirname + '/../../../../../e2e/e2e-app/tsconfig.json',
    });
    expect(result).toMatchSnapshot();
  });
});
