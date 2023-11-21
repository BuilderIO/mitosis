import { For } from '@builder.io/mitosis';

export interface ItemListProps {
  list: string[];
  deleteItem: (idx: number) => void;
}

export default function ItemList(props: ItemListProps) {
  return (
    <ul
      css={{
        borderRadius: '0.25rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        margin: 'unset',
        padding: 'unset',
      }}
    >
      <For each={props.list}>
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
                props.deleteItem(idx);
              }}
            >
              Delete
            </button>
          </li>
        )}
      </For>
    </ul>
  );
}
