import { useStore } from '@builder.io/mitosis';

export default function StringLiteralStore() {
  const state = useStore({
    foo: true, // Comment
    bar() {},
  });

  return <>{state.foo}</>;
}
