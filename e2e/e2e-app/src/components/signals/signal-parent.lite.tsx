import { onMount, useState, useStore } from '@builder.io/mitosis';
import SignalItemList from './signal-item-list.lite';

export default function SignalParent() {
  const [n] = useState(['123'], { reactive: true });

  const state = useStore({
    someFn() {
      console.log(n, n.value);
      n.value[0] = '123';
    },
  });

  onMount(() => {
    console.log(n, n.value);
  });

  return (
    <div>
      <SignalItemList list={n} />
      <span>{n.value}</span>
      <button onClick={state.someFn}>Click me</button>
      <div title={n.value.toString()} />
    </div>
  );
}
