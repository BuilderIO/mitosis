import { useState, Show, For } from '@builder.io/mitosis';
import { number } from 'fp-ts';

export interface SectionProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}

export default function SectionStateComponent(props: SectionProps) {
  const state = useState({
    max: 42,
    items: [42],
  });
  return (
    <Show when={state.max}>
      <For each={state.items}>
        {(item) => (
          <section {...props.attributes} style={{ maxWidth: item + state.max }}>
            {props.children}
          </section>
        )}
      </For>
    </Show>
  );
}
