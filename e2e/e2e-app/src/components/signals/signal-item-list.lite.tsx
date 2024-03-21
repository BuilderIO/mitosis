import { onMount, Signal, useStore } from '@builder.io/mitosis';

interface ItemListProps {
  list: Signal<string[]>;
}

export default function SignalItemList(props: ItemListProps) {
  const state = useStore({
    someFn() {
      console.log(props.list, props.list.value[0]);
      props.list.value[0] = 'hello';
    },
  });

  onMount(() => {
    console.log(props.list, props.list.value[0]);
  });

  return (
    <ul class="shadow-md rounded">
      {props.list.value.map((item) => (
        <li
          class="border-gray-200 border-b"
          css={{
            padding: '10px',
          }}
        >
          {item}
          <button onClick={state.someFn}>Click me</button>
        </li>
      ))}
    </ul>
  );
}
