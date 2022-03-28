import { onUpdate, useState } from '@builder.io/mitosis';

export default function MultipleOnUpdateWithDeps() {
  const state = useState({
    a: 'a',
    b: 'b',
    c: 'c',
    d: 'd',
  });

  onUpdate(() => {
    console.log('Runs when a or b changes', state.a, state.b);
  }, [state.a, state.b]);

  onUpdate(() => {
    console.log('Runs when c or d changes', state.c, state.d);
  }, [state.c, state.d]);

  return <div />;
}
