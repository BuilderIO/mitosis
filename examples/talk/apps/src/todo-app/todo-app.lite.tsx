import { useStore } from '@builder.io/mitosis';

import ItemList from './item-list.lite';

export interface State {
  list: string[];
  newItemName: string;
  setItemName: any;
  addItem: () => void;
  deleteItem: (k: number) => void;
}

export default function TodoApp(props: {}) {
  const state = useStore<State>({
    list: ['hello', 'world'],
    newItemName: 'New item',

    setItemName(event: Event) {
      state.newItemName = (event.target as any).value;
    },

    addItem() {
      state.list = [...state.list, state.newItemName];
    },

    deleteItem(index) {
      state.list = state.list.filter((x, i) => i !== index);
    },
  });

  return (
    <div css={{ padding: '10px' }}>
      <link
        href="/Users/samijaber/code/work/mitosis/examples/talk/apps/src/tailwind.min.css"
        rel="stylesheet"
      />
      <input
        class="shadow-md rounded w-full px-4 py-2"
        value={state.newItemName}
        onChange={(event) => state.setItemName(event)}
      />{' '}
      <button
        class="bg-blue-500 rounded w-full text-white font-bold py-2 px-4 my-1"
        onClick={() => state.addItem()}
      >
        Add list item
      </button>
      <ItemList list={state.list} deleteItem={state.deleteItem}></ItemList>
    </div>
  );
}
