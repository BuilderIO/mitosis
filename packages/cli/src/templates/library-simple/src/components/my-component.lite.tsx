// TODO: get the exports alias working here so this is just `import '@builder.io/mitosis/jsx'
import '@builder.io/mitosis/dist/src/jsx-types';
import { useState, Show } from '@builder.io/mitosis';

type MyProps = {
  showInput?: boolean;
};

export default function MyComponent(props: MyProps) {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      <Show when={props.showInput}>
        <input
          css={{ color: 'red' }}
          value={state.name}
          onChange={(event) => (state.name = event.target.value)}
        />
      </Show>
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
