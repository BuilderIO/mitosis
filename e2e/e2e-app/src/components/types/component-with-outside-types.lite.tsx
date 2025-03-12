import { useStore } from '@builder.io/mitosis';
import { OutsideState, Props } from './data';

export default function ComponentWithOutsideTypes(props: Props) {
  const state = useStore<OutsideState>({
    _text: undefined,
    handleClick: () => {
      if (props.onGetClicked) {
        props.onGetClicked();
      }
      if (props.onEnter) {
        props.onEnter();
        state._text = 'After';
      }
    },
  });

  return <button onClick={() => state.handleClick()}>{state._text ?? props.text}</button>;
}
