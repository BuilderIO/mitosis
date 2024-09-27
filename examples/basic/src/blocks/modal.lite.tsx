import {useStore} from '@builder.io/mitosis';

export interface ModalProps {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function Modal(props: ModalProps) {

  const state = useStore({
    _onCancel() {
        props.onCancel()
    },

    _onConfirm() {
        props.onConfirm('Joe')
    },
  });


  return (
  <>
    <button onClick={() => state._onCancel()}>Cancel</button>
    <button onClick={() => state._onConfirm()}>Confirm</button>
  </>
  );
}
