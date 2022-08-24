import { onUpdate, useStore } from '@builder.io/mitosis';

export default function MultipleOnUpdateWithDeps() {
  const state = useStore({
    a: 'a',
    b: 'b',
    c: 'c',
    d: 'd',
  });

  onUpdate(() => {
    console.log('Runs when a or b changes', state.a, state.b);
    if (state.a === 'a') {
      state.a = 'b';
    }
  }, [state.a, state.b]);

  onUpdate(() => {
    console.log('Runs when c or d changes', state.c, state.d);
    if (state.a === 'a') {
      state.a = 'b';
    }
  }, [state.c, state.d]);

  return <div />;
}
