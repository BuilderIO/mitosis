export interface ItemListProps {
  list: string[];
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
      {props.list.map((item) => (
        <li
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
              props.list.splice(
                0,
                props.list.length,
                ...props.list.filter((x, i) => i !== props.list.indexOf(item)),
              );
            }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
