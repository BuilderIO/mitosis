import { useStore } from '@builder.io/mitosis';

export default function MyComponent() {
  const state = useStore({
    errors: {},
    foo(errors) {
      return errors;
    },
  });

  return <>{state.foo(state.errors)}</>;
}
