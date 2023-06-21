import { findSignalAccess } from './types-identification';

describe('findSignalAccess', () => {
  test('x', () => {
    const code = `
    import { Signal, useSignal } from '@builder.io/mitosis';

    type K = Signal<string>;
    
    type Props = {
      k: K;
    };
        
    const MyComponent = (props: Props) => {
      const [n] = useSignal(123);
    
      console.log(n, n.value, props.k, props.k.value);
    
      return <RenderBlock a={props.k} b={props.k.value} c={n} d={n.value} />;
    };
`;
    const result = findSignalAccess({ code, tsConfigFilePath: '' });
    expect(result).toMatchSnapshot();
  });
});
