import { useState } from '@builder.io/mitosis';

export default function EventInputAndChange(props) {
  const [name, setName] = useState('Steve');

  return (
    <div>
      <input
        css={{
          color: 'red',
        }}
        value={name}
        onInput={(event) => setName(event.target.value)}
        onChange={(event) => setName(event.target.value)}
      />
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
