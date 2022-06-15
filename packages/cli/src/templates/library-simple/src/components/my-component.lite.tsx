import { useStore, Show } from '@builder.io/mitosis';

type MyProps = {
  showInput?: boolean;
};

export default function MyComponent(props: MyProps) {
  const state = useStore({
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
