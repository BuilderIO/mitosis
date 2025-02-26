import { onMount, onUpdate, useRef, useStore } from '@builder.io/mitosis';

type Store = { initial: boolean; counter: number; label?: string; handleClick: () => void };

export default function ComponentOnUpdate(props: any) {
  const _ref = useRef<HTMLDivElement | null>(null);

  const state = useStore<Store>({
    initial: false,
    counter: 0,
    label: undefined,
    handleClick: () => {
      state.counter = state.counter + 1;
    },
  });

  onMount(() => {
    state.initial = true;
  });

  onUpdate(() => {
    if (_ref && !state.initial) {
      state.initial = true;
    }
  }, [_ref, state.initial]);

  onUpdate(() => {
    console.log(state);
  });

  onUpdate(() => {
    if (state.initial) {
      state.label = 'Label';
    }
  }, [state.initial]);

  onUpdate(() => {
    if (_ref && state.label) {
      _ref.setAttribute('aria-label', `${state.label}: ${state.counter}`);
    }
  }, [_ref, state.counter, state.label]);

  return (
    <div ref={_ref} data-testid="container">
      Hello {state.counter}
      <button data-testid="button" onClick={() => state.handleClick()}>
        Increase
      </button>
    </div>
  );
}
