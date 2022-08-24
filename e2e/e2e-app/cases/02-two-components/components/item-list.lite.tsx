export interface ItemListProps {
  list: string[];
}

export default function ItemList(props: ItemListProps) {
  return (
    <ul class="shadow-md rounded">
      {props.list.map((item) => (
        <li
          class="border-gray-200 border-b"
          css={{
            padding: '10px',
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
