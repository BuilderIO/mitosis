import { useMetadata, useStore } from '@builder.io/mitosis';

import ItemList from './item-list.lite';

useMetadata({
  qwik: {
    mutable: ['state.list'],
  },
});

export interface State {
  list: string[];
  newItemName: string;
  setItemName: any;
  addItem: any;
}

export default function NestedParent(props: any) {
  const state = useStore<State>({
    list: ['hello', 'world'],
    newItemName: 'New item',

    setItemName(event: any) {
      state.newItemName = (event.target as any).value;
    },

    addItem() {
      state.list = [...state.list, state.newItemName];
    },
  });

  return (
    <div
      css={{
        padding: '10px',
      }}
    >
      <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet" />

      <input
        class="shadow-md rounded w-full px-4 py-2"
        value={state.newItemName}
        onChange={(event) => state.setItemName(event)}
      />

      <button
        class="bg-blue-500 rounded w-full text-white font-bold py-2 px-4"
        css={{
          margin: '10px 0',
        }}
        onClick={() => state.addItem()}
      >
        Add list item
      </button>

      <ItemList list={state.list}></ItemList>
    </div>
  );
}
