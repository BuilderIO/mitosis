import { useStore } from '@builder.io/mitosis';

export default function Button(props: { foo: string }) {
  const state = useStore({
    get foo2() {
      return props.foo + 'foo';
    },

    get bar() {
      return 'bar';
    },

    baz(i: number) {
      return i + state.foo2.length;
    },
  });
  return (
    <div>
      <p>{state.foo2}</p>
      <p>{state.bar}</p>
      <p>{state.baz(1)}</p>
    </div>
  );
}
