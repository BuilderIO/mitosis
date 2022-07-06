import { onUpdate, useStore } from '@builder.io/mitosis';

export default function OnUpdateWithDeps() {
  const state = useStore({
    a: 'a',
    b: 'b',
  });

  onUpdate(() => {
    console.log('Runs when a or b changes', state.a, state.b);
  }, [state.a, state.b]);

  return <div />;
}
