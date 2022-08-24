type Person = {
  name: string;
  age?: number;
};

export default function MyBasicComponent(props: Person) {
  return <div>Hello! I can run in React, Vue, Solid, or Liquid! {props.name}</div>;
}
