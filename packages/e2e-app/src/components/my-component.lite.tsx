import '@builder.io/mitosis/dist/src/jsx-types';
import { useStore } from '@builder.io/mitosis';

export interface State {
  list: string[];
  newItemName: string;
}

export default function MyComponent(props: any) {
  const state = useStore<State>({
    list: ['hello', 'world'],
    newItemName: 'New item',
  });

  function addItem() {
    state.list = [...state.list, state.newItemName];
  }

  return (
    <div
      css={{
        padding: '10px',
      }}
    >
      <link
        href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
        rel="stylesheet"
      />

      <input
        class="shadow-md rounded w-full px-4 py-2"
        value={state.newItemName}
        onChange={(event) => (state.newItemName = event.target.value)}
      />

      <button
        class="bg-blue-500 rounded w-full text-white font-bold py-2 px-4"
        css={{
          margin: '10px 0',
        }}
        onClick={(event) => addItem()}
      >
        Add list item
      </button>

      <ul class="shadow-md rounded">
        {state.list.map((item) => (
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
    </div>
  );
}
