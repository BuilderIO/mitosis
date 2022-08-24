import { useStore } from '@builder.io/mitosis';

export default function MyBasicComponent() {
  const state = useStore({
    name: 'Steve',
  });

  return (
    <div
      class="test"
      css={{
        padding: '10px',
      }}
    >
      <input
        value={state.name}
        onChange={(myEvent) => {
          state.name = myEvent.target.value;
        }}
      />
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
