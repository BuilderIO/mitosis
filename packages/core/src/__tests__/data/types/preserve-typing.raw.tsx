export type A = 'test';
export interface C {
  n: 'test';
}

type B = 'test2';
interface D {
  n: 'test';
}

export default function MyBasicComponent(props: { name: string; age?: number }) {
  return <div>Hello! I can run in React, Vue, Solid, or Liquid! {props.name}</div>;
}
