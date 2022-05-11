import { Slot } from '@builder.io/mitosis';

type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return (
    <div>
      <Slot name={props.slotTesting} />
      <div>
        <hr />
      </div>
      <div>{props.children}</div>
    </div>
  );
}
