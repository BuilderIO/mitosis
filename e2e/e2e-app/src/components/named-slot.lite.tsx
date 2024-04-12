import { Slot } from '@builder.io/mitosis';

export default function NamedSlot() {
  return (
    <div>
      <Slot name="testSlot" />
    </div>
  );
}
