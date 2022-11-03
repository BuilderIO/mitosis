export default function NestedStyles() {
  return (
    <div
      css={{
        display: 'flex',
        foo: 'var(--bar)',
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
