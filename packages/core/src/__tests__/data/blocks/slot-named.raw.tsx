import { Slot } from '@builder.io/mitosis';

type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return (
    <div>
      <Slot name="myAwesomeSlot" />
      <Slot name="top" />
      <Slot name="left">Default left</Slot>
      <Slot>Default Child</Slot>
    </div>
  );
}
