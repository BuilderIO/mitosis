import { onUpdate, useStore } from '@builder.io/mitosis';

type Props = {
  size: string;
};

export default function OnUpdateWithDeps(props: Props) {
  const state = useStore({
    a: 'a',
    b: 'b',
  });

  onUpdate(() => {
    console.log('Runs when a, b or size changes', state.a, state.b, props.size);
  }, [state.a, state.b, props.size]);

  return <div />;
}
