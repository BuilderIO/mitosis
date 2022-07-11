import { useState, useStore } from '@builder.io/mitosis';

export default function MyBasicComponent() {
  const [classState, setClassState] = useState('testClassName');
  const state = useStore({
    customStyles: {
      color: 'red',
    },
  });

  return (
    <div
      class={classState}
      css={{
        padding: '10px',
      }}
      style={state.customStyles}
    >
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
