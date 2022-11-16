export interface ItemListProps {
  list: string[];
  deleteItem: (k: number) => void;
}

export default function ItemList(props: ItemListProps) {
  return (
    <ul class="shadow-md rounded">
      {props.list.map((item) => (
        <li class="border-gray-200 border-b flex items-center p-2.5">
          <span>{item}</span>
          <button
            class="bg-red-500 rounded text-white py-2 px-4 ml-auto"
            onClick={() => props.deleteItem(props.list.indexOf(item))}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
