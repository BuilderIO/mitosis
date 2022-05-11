type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return (
    <div>
      <Slot name={props.testing} />
      <div>
        <OtherComponentWithSlot slotRight={<someContent></someContent>} />
      </div>
      <div>{props.children}</div>
    </div>
  );
}
