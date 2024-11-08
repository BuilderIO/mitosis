import { For, onMount, useStore } from '@builder.io/mitosis';

export default function MyBasicForComponent() {
  const state = useStore({
    name: 'PatrickJS',
    names: ['Steve', 'PatrickJS'],
  });

  onMount(() => {
    console.log('onMount code');
  });

  return (
    <div>
      <For each={state.names}>
        {(person) => (
          <>
            <input
              value={state.name}
              onChange={(event) => {
                state.name = event.target.value + ' and ' + person;
              }}
            />
            Hello {person}! I can run in Qwik, Web Component, React, Vue, Solid, or Liquid!
          </>
        )}
      </For>
    </div>
  );
}
