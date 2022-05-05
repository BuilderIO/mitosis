import { useState, For } from '@builder.io/mitosis';

export default function MyBasicForComponent() {
  const state = useState({
    name: 'PatrickJS',
    names: ['Steve', 'PatrickJS'],
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
            Hello {person}! I can run in Qwik, Web Component, React, Vue, Solid,
            or Liquid!
          </>
        )}
      </For>
    </div>
  );
}
