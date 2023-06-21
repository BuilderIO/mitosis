import { onMount, useState, useStore } from '@builder.io/mitosis';
import SignalItemList from './child.lite';

export default function SignalParent() {
  const [n] = useState('123', { reactive: true });

  const store = useStore({
    someFn() {
      console.log(n, n.value);
      n.value = '123';
    },
  });

  onMount(() => {
    console.log(n, n.value);
  });

  return (
    <div>
      <SignalItemList list={[n]} />
      <span>{n.value}</span>
      <button onClick={store.someFn}>Click me</button>
      <div title={n.value.toString()} />
    </div>
  );
}
