import type { JSX } from '../../../../jsx-runtime';
import { Show } from '@builder.io/mitosis';

type Props = {
  [key: string]: string | JSX.Element;
};

export default function ContentSlotJsxCode(props: Props) {
  return (
    <div>
      <Show when={props.slotTesting}>
        <div>{props.slotTesting}</div>
      </Show>
      <div>
        <hr />
      </div>
      <div>{props.children}</div>
    </div>
  );
}
