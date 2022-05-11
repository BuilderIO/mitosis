import { Slot } from '@builder.io/mitosis';

type Props = {
  [key: string]: string | JSX.Element;
  slotTesting: JSX.Element;
};

export default function ContentSlotCode(props: Props) {
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
