type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return <div>{props.children}</div>;
}
