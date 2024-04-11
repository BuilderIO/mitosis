import { For, Show, useStore } from '@builder.io/mitosis';

export default function ShowForComponent() {
  const state = useStore({
    numbers: [1, 2, 3],
    vowels: ['a', 'e', 'i', 'o', 'u'],
  });

  return (
    <div>
      <Show
        when={state.numbers}
        else={<For each={state.vowels}>{(vowel) => <h1>vowel :{vowel}</h1>}</For>}
      >
        <For each={state.numbers}>{(number) => <h1>number :{number}</h1>}</For>
      </Show>
    </div>
  );
}
