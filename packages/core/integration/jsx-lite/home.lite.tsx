import { useState } from '@jsx-lite/core';

export default function Home() {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div css={{ textAlign: 'center' }}>
      <h2>Hello, {state.name}!</h2>
      <input
        value={state.name}
        onChange={(event) => (state.name = event.target.value)}
      />
    </div>
  );
}
