import { useState } from '@dummy/custom-mitosis';

export default function MyBasicComponent() {
  const state = useState({
    name: 'PatrickJS',
  });

  return (
    <div>
      Hello {state.name}! I can run in React, Qwik, Vue, Solid, or Liquid!
    </div>
  );
}
