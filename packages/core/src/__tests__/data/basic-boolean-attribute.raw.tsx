import MyBooleanAttributeComponent from './basic-boolean-attribute-component.raw';

type Props = {
  children: any;
  type: string;
};

export default function MyBooleanAttribute(props: Props) {
  return (
    <div>
      {props.children} {props.type}
      <MyBooleanAttributeComponent toggle />
      <MyBooleanAttributeComponent toggle={true} />
      <MyBooleanAttributeComponent list={null} />
    </div>
  );
}
