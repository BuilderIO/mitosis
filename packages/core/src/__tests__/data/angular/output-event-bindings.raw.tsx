import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const [name, setName] = useState('Steve');

  return (
    <div>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onChangeOrSomething={(event) => setName(event.target.value)}
      />
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
