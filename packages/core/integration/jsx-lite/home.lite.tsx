import { useState } from '@jsx-lite/core';

export default function MyComponent(props) {
  const state = useState({ name: 'Steve' });

  return (
    <div
      css={{
        textAlign: 'center',
        color: 'steelblue',
      }}
    >
      <h2>
        <div>Hello, </div>
      </h2>
      <input
        value={state.name}
        onChange={(event) => (state.name = event.target.value)}
      />
    </div>
  );
}
