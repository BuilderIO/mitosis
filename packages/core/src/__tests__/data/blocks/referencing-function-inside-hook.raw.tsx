import { onUpdate } from '@builder.io/mitosis';

export default function OnUpdate() {
  onUpdate(() => {
    foo({
      someOption: bar,
    });
  });

  function foo(params) {}

  function bar() {}

  function zoo() {
    const params = {
      cb: bar,
    };
  }

  return <div />;
}
