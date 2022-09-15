type Props = {
  toggle?: boolean;
  list?: null | Array<undefined>;
};

export default function MyBooleanAttributeComponent(props: Props) {
  return (
    <div>
      {props.toggle} {props.list}
    </div>
  );
}
