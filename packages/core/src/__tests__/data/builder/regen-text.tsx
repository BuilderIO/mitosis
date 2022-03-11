import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useState({ people: ['Steve', 'Sewell'] });

  return (
    <div
      css={{
        padding: '20px',
      }}
    >
      <h2
        css={{
          marginBottom: '20px',
        }}
      >
        Hello!
      </h2>
    </div>
  );
}
