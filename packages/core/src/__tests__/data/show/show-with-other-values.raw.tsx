import { Show } from '@builder.io/mitosis';

interface Props {
  conditionA: boolean;
}

export default function ShowWithOtherValues(props: Props) {
  return (
    <div>
      <Show when={props.conditionA} else={null}>
        ContentA
      </Show>
      <Show when={props.conditionA} else={undefined}>
        ContentB
      </Show>
      <Show when={props.conditionA} else={true}>
        ContentC
      </Show>
      <Show when={props.conditionA} else={false}>
        ContentD
      </Show>
      <Show when={props.conditionA} else={'hello'}>
        ContentE
      </Show>
      <Show when={props.conditionA} else={123}>
        ContentF
      </Show>
    </div>
  );
}
