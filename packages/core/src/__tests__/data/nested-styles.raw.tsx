export default function NestedStyles() {
  return (
    <div
      css={{
        display: 'flex',
        '--bar': 'red',
        color: 'var(--bar)',
        '@media (max-width: env(--mobile))': {
          display: 'block',
        },
        '&:hover': {
          display: 'flex',
        },
        ':active': {
          display: 'inline',
        },
        '.nested-selector': {
          display: 'grid',
        },
        '.nested-selector:hover': {
          display: 'block',
        },
        '&.nested-selector:active': {
          display: 'inline-block',
        },
      }}
    >
      Hello world
    </div>
  );
}
