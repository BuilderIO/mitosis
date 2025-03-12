import { onUpdate, useDefaultProps, useRef, useStore } from '@builder.io/mitosis';

type Props = {
  testInput: string;
  testOutput?: () => void;
};

type Store = {
  _counter: number;
  handleOutput: () => void;
};

useDefaultProps<Props>({
  testInput: 'Test',
});

export default function SignalsTestComponent(props: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const state = useStore<Store>({
    _counter: 0,
    handleOutput: () => {
      console.log(props.testInput, state._counter);
      state._counter++;
      if (props.testOutput) {
        props.testOutput();
      }
    },
  });

  onUpdate(() => {
    console.log(state._counter, buttonRef);
  }, [state._counter, buttonRef]);

  return (
    <button ref={buttonRef} onClick={() => state.handleOutput()}>
      {props.testInput}
    </button>
  );
}
