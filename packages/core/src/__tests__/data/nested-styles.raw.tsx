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
        '.nested-selector': {
          display: 'grid',
        },
      }}
    >
      Hello world
    </div>
  );
}
