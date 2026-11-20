import { For } from '@builder.io/mitosis';

export interface ItemListProps {
  list: string[];
}

export default function ItemList(props: ItemListProps) {
  return (
    <ul class="shadow-md rounded">
      <For each={props.list}>
        {(item) => (
          <li
            class="border-gray-200 border-b"
            css={{
              padding: '10px',
            }}
          >
            {item}
          </li>
        )}
      </For>
    </ul>
  );
}
