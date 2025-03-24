import { onUpdate, useDefaultProps, useRef, useStore } from '@builder.io/mitosis';

type Props = {
  label: string;
  testInput: string;
  onTestOutput?: () => void;
};

type Store = {
  _counter: number;
  _innerText: string;
  handleOutput: () => void;
};

useDefaultProps<Props>({
  testInput: 'Test',
  label: 'Bla',
});

export default function SignalsTestComponent(props: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const state = useStore<Store>({
    _counter: 0,
    _innerText: 'a',
    handleOutput: () => {
      state._counter++;
      state._innerText = 'b';
      console.log(props.testInput, state._counter);
      if (props.onTestOutput) {
        props.onTestOutput();
      }
    },
  });

  onUpdate(() => {
    console.log(state._counter, buttonRef);
    buttonRef?.setAttribute('data-counter', state._counter.toString());
  }, [state._counter, buttonRef]);

  return (
    <button aria-label={props.label} ref={buttonRef} onClick={() => state.handleOutput()}>
      {props.testInput}
    </button>
  );
}
