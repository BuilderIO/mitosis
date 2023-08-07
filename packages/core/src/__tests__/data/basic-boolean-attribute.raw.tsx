import MyBooleanAttributeComponent from './basic-boolean-attribute-component.raw';

type Props = {
  children: any;
  type: string;
};

export default function MyBooleanAttribute(props: Props) {
  return (
    <div>
      <Show when={props.children}>
        {props.children} {props.type}
      </Show>
      <MyBooleanAttributeComponent toggle />
      <MyBooleanAttributeComponent toggle={true} />
      <MyBooleanAttributeComponent list={null} />
    </div>
  );
}
