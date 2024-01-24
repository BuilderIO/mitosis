import { Slot } from '@builder.io/mitosis';

type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return (
    <div>
      <Slot name="top" data={props.data} />
      <Slot name="left" left={props.data}>Left</Slot>
      <p>Default slots</p>
      <Slot name="default" data={props.data}>Default, named Child</Slot>
    </div>
  );
}
