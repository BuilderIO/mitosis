import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  function add(a, b) {
    return a + b;
  }
  const state = useStore({
    asfas: 'asga',
    subtract: () => {
      return state.someCompute - state.someOtherVal;
    },
    someCompute: add(1, 2),
    someOtherVal: props.val,
    sf: add(props.val, 34),
  });

  return (
    <div>
      <div>{state.asfas}</div>
      <div>{state.someCompute}</div>
      <div>{state.someOtherVal}</div>
      <div>{state.sf}</div>
    </div>
  );
}
