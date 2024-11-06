import { useStore } from '@builder.io/mitosis';

export default function MyComponent() {
  useStore({
    errors: {},
    foo(errors) {
      return errors;
    },
  });

  return <></>;
}
