import { FooProps } from './foo-props';

export default function TypeExternalProps(props: FooProps) {
  return <div>Hello {props.name}! </div>;
}
