import { Slot } from '@builder.io/mitosis';
import ContentSlotCode from './content-slot-jsx.raw';

type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return (
    <div>
      <ContentSlotCode slotContent={<div>Hello</div>} />
      <ContentSlotCode>
        <Slot content={<div>Hello</div>} />
      </ContentSlotCode>
      <ContentSlotCode>
        <Slot content={<div>Hello {contentProps.stateName}</div>}></Slot>
      </ContentSlotCode>
    </div>
  );
}
