import { Slot } from '@builder.io/mitosis';

type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return (
    <div>
      <Slot name="top" />
      <Slot name="left">Left</Slot>
      <p>Default slots</p>
      <Slot>Default Child</Slot>
      <Slot name="default">Default, named Child</Slot>
    </div>
  );
}
