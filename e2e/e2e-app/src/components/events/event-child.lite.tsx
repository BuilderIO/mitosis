import { useStore } from '@builder.io/mitosis';

export interface EventChildProps {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function EventChild(props: EventChildProps) {
  const state = useStore({
    _onCancel() {
      props.onCancel();
    },

    _onConfirm() {
      props.onConfirm('Joe');
    },
  });

  return (
    <>
      <button onClick={() => state._onCancel()}>Cancel</button>
      <button onClick={() => state._onConfirm()}>Confirm</button>
    </>
  );
}
