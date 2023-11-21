import { For, useStore } from '@builder.io/mitosis';

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
        <ul
          css={{
            borderRadius: '0.25rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            margin: 'unset',
            padding: 'unset',
          }}
        >
          <For each={state.list}>
            {(item, idx) => (
              <li
                key={idx}
                css={{
                  display: 'flex',
                  padding: '0.625rem',
                  alignItems: 'center',
                  borderBottomWidth: '1px',
                  borderColor: '#E5E7EB',
                  gap: '16px',
                }}
              >
                <span>{item}</span>
                <button
                  css={{
                    cursor: 'pointer',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    borderRadius: '0.25rem',
                    color: '#ffffff',
                    backgroundColor: '#EF4444',
                  }}
                  onClick={() => {
                    state.deleteItem(idx);
                  }}
                >
                  Delete
                </button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
}
