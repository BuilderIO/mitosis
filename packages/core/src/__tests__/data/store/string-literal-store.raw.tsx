import { useStore } from '@builder.io/mitosis';

export default function StringLiteralStore() {
  /* prettier-ignore */
  const state = useStore({ "foo": 123 });

  return <div>{state.foo}</div>;
}
