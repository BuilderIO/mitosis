import { useState, Show, For } from '@builder.io/mitosis';

export interface SectionProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}

export default function SectionStateComponent(props: SectionProps) {
  const [max, setMax] = useState(42);
  return (
    <Show when={max}>
      <For each={[42]}>
        {(item) => (
          <section {...props.attributes} style={{ maxWidth: item + max }}>
            {props.children}
          </section>
        )}
      </For>
    </Show>
  );
}
