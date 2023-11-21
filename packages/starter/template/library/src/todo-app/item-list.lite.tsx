export interface ItemListProps {
  list: string[];
}

export default function ItemList(props: ItemListProps) {
  return (
    <ul class="shadow-md rounded">
      {props.list.map((item) => (
        <li class="border-gray-200 border-b flex items-center p-2.5">
          <span>{item}</span>
          <button
            class="bg-red-500 rounded text-white py-2 px-4 ml-auto"
            onClick={() => {
              props.list = props.list.filter((x, i) => i !== props.list.indexOf(item));
            }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
