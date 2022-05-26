import { useState } from '@builder.io/mitosis';

export default function MyBasicComponent() {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      <input
        value={state.name}
        onChange={(myEvent) => (state.name = myEvent.target.value)}
      />
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
