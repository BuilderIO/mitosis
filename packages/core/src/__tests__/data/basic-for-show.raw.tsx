import { useState, For, Show } from '@builder.io/mitosis';

export default function MyBasicForShowComponent() {
  const state = useState({
    name: 'PatrickJS',
    names: ['Steve', 'PatrickJS'],
  });

  return (
    <div>
      <For each={state.names}>
        {(person) => (
          <Show when={person === state.name}>
            <input
              value={state.name}
              onChange={(event) => {
                state.name = event.target.value + ' and ' + person;
              }}
            />
            Hello {person}! I can run in Qwik, Web Component, React, Vue, Solid,
            or Liquid!
          </Show>
        )}
      </For>
    </div>
  );
}
