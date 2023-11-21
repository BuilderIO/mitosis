import { useStore } from '@builder.io/mitosis';

import ItemList from './item-list.lite';

export default function TodoApp() {
  const state = useStore({
    list: ['hello', 'world'],
    newItemName: '',
    addItem() {
      if (!state.newItemName) {
        return;
      }
      state.list = [...state.list, state.newItemName];
    },
    deleteItem(idx: number) {
      state.list = state.list.filter((x, i) => i !== idx);
    },
  });

  return (
    <div css={{ padding: '10px', maxWidth: '700px' }}>
      <span>TO-DO list:</span>
      <div
        css={{
          display: 'flex',
          width: '100%',
          gap: '16px',
          alignItems: 'stretch',
        }}
      >
        <input
          css={{
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            borderRadius: '0.25rem',
            flexGrow: '1',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
          value={state.newItemName}
          onChange={(event) => (state.newItemName = event.target.value)}
          placeholder="Add a new item"
        />
        <button
          css={{
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            borderRadius: '0.25rem',
            fontWeight: '700',
            color: '#ffffff',
            backgroundColor: '#3B82F6',
            cursor: 'pointer',
          }}
          onClick={() => state.addItem()}
        >
          Add
        </button>
      </div>
      <div
        css={{
          marginTop: '1rem',
        }}
      >
        <ItemList list={state.list} deleteItem={(i) => state.deleteItem(i)}></ItemList>
      </div>
    </div>
  );
}
