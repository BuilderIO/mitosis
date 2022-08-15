import type { Foo } from './foo-type';

export type TypeDependencyProps = {
  foo: Foo;
};

export default function TypeDependency(props: TypeDependencyProps) {
  return <div>{props.foo}</div>;
}
