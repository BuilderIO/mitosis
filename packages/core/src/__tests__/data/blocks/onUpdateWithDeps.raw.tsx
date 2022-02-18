import { onUpdate } from '@builder.io/mitosis';

export default function OnUpdateWithDeps() {
  onUpdate(() => {
    console.log('Runs when a or b changes');
  }, [a, b]);

  return <div />;
}
