import { onMount, Signal, useStore } from '@builder.io/mitosis';

interface ItemListProps {
  list: Signal<string>[];
}

export default function SignalItemList(props: ItemListProps) {
  const store = useStore({
    someFn() {
      console.log(props.list, props.list[0].value);
      props.list[0].value = 'hello';
    },
  });

  onMount(() => {
    console.log(props.list[0], props.list[0].value);
  });

  return (
    <ul class="shadow-md rounded">
      {props.list.map((item) => (
        <li
          class="border-gray-200 border-b"
          css={{
            padding: '10px',
          }}
        >
          {item.value}
          <button onClick={store.someFn}>Click me</button>
        </li>
      ))}
    </ul>
  );
}
