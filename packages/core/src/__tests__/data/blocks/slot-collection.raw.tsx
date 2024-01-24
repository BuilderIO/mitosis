import { Slot } from '@builder.io/mitosis';
import { For } from '../../../flow';

type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return (
    <ul>
      <For each={props.someCollection}>
        {(item) => (
          <li><Slot name="itemDisplay" item={item} /></li>
        )}
      </For>
    </ul>
  );
}
