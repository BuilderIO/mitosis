import { useStore } from '@builder.io/mitosis';

export const DEFAULT_VALUES = {
  name: 'Steve',
};

export default function MyBasicComponent() {
  const state = useStore({
    name: 'Steve',
    underscore_fn_name() {
      return 'bar';
    },
  });

  return (
    <div
      class="test"
      css={{
        padding: '10px',
      }}
    >
      <input
        value={DEFAULT_VALUES.name || state.name}
        onChange={(myEvent) => (state.name = myEvent.target.value)}
      />
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
