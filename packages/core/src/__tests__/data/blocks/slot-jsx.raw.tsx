import ContentSlotCode from './content-slot-jsx.raw';

type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return (
    <div>
      <ContentSlotCode slotTesting={<div>Hello</div>} />
    </div>
  );
}
