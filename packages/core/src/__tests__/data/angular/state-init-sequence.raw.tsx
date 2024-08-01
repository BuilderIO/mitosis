import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    val: props.value,
  });
  return <Comp val={{ ...state.val }}>{state.val}</Comp>;
}
