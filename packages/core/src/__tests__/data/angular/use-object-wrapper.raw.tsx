import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    attributes: { id: 1 },
    attributes2: { id2: 1 },
    something: { id3: 1 },
  });

  return (
    <div>
      <Comp
        val1={{ ...state.attributes2 }}
        val2={{
          ...state.attributes,
          ...state.attributes2,
        }}
        val3={{
          ...state.something,
          anything: 'hello',
          hello: 'world',
        }}
        val4={{
          ...state.attributes,
          ...state.something,
          anything: [1, 2, 3],
          hello: 'hello',
          ...state.attributes2,
        }}
        val5={{
          ...state.attributes,
          ...state.something,
          anything: [1, 2, 3],
          anythingString: ['a', 'b', 'c'],
          hello: 'hello',
          ...props.spreadAttrs,
        }}
        val6={{ anything: [1, 2, 3] }}
      />
    </div>
  );
}
