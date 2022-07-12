import { For, Show } from '@builder.io/mitosis';

interface Props {
  conditionA: boolean;
  items: string[];
}
export default function NestedShow(props: Props) {
  return (
    <Show when={props.conditionA} else={<div>else-condition-A</div>}>
      <For each={props.items}>{(item, idx) => <div key={idx}>{item}</div>}</For>
    </Show>
  );
}
