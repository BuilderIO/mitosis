import { Show } from '@builder.io/mitosis';

interface Props {
  conditionA: boolean;
}

export default function ShowRootText(props: Props) {
  return (
    <Show when={props.conditionA} else={<div>else-condition-A</div>}>
      ContentA
    </Show>
  );
}
