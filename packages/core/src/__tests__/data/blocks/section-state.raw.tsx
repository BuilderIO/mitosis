import { For, Show, useStore } from '@builder.io/mitosis';

export interface SectionProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}

export default function SectionStateComponent(props: SectionProps) {
  const state = useStore({
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
