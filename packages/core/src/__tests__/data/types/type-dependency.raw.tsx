import type { Foo } from './foo-type';
import type { Foo as Foo2 } from './type-export.lite';

export type TypeDependencyProps = {
  foo: Foo;
  foo2: Foo2;
};

export default function TypeDependency(props: TypeDependencyProps) {
  return <div>{props.foo}</div>;
}
