import { useState, onUpdate } from '@builder.io/mitosis';

export interface Props {
  name: string;
}

export default function MyBasicComponent(props: Props) {
  const state = useState({
    name: 'Steve',
  });

  onUpdate(() => {
    console.log('name 1');
    if (state.name === 'Steve') {
      state.name = 'PatrickJS';
    }
  }, [state.name]);

  onUpdate(() => {
    console.log('name 2');
    if (state.name === 'PatrickJS') {
      state.name = 'Hi';
    }
  }, [props.name]);

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
