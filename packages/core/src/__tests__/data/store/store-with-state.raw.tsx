import { useState, useStore } from '@builder.io/mitosis';

export default function MyComponent() {
  const [foo, _] = useState(false);
  useStore({
    bar() {
      return foo;
    },
  });

  return <></>;
}
