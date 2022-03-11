import { useState, For } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useState({ people: ['Steve', 'Sewell'] });

  return (
    <For each={state.people}>
      {(person, index) => (
        <div
          key={person}
          css={{
            padding: '10px 0',
          }}
        >
          {person} {index}
        </div>
      )}
    </For>
  );
}
