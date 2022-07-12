import { useState } from '@builder.io/mitosis';

export default function MyBasicComponent() {
  const [classState, setClassState] = useState('testClassName');
  const [styleState, setStyleState] = useState({ color: 'red' });

  return (
    <div
      class={classState}
      css={{
        padding: '10px',
      }}
      style={styleState}
    >
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
