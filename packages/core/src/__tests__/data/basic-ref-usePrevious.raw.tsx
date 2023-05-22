import { onUpdate, useRef, useStore } from '@builder.io/mitosis';

export interface Props {
  showInput: boolean;
}

export function usePrevious<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  let ref = useRef<T>(null);
  // Store current value in ref
  onUpdate(() => {
    ref = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref;
}

export default function MyPreviousComponent(props: Props) {
  const state = useStore({
    count: 0,
  });

  let prevCount = useRef(state.count);

  onUpdate(() => {
    prevCount = state.count;
  }, [state.count]); //
  // Get the previous value (was passed into hook on last render)
  // const prevCount = usePrevious(state.count);
  // Display both current and previous count value
  return (
    <div>
      <h1>
        Now: {state.count}, before: {prevCount}
      </h1>
      <button onClick={() => (state.count += 1)}>Increment</button>
    </div>
  );
}
