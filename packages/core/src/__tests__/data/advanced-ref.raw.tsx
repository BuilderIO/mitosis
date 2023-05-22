import { onUpdate, useRef, useStore } from '@builder.io/mitosis';

export interface Props {
  showInput: boolean;
}

export default function MyBasicRefComponent(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputNoArgRef = useRef<HTMLLabelElement>(null);

  const state = useStore({
    name: 'PatrickJS',
  });

  function onBlur() {
    // Maintain focus
    inputRef.focus();
  }

  function lowerCaseName() {
    return state.name.toLowerCase();
  }

  onUpdate(() => {
    console.log('Received an update');
  }, [inputRef, inputNoArgRef]);

  return (
    <div>
      {props.showInput && (
        <>
          <input
            ref={inputRef}
            css={{
              color: 'red',
            }}
            value={state.name}
            onBlur={(event) => onBlur()}
            onChange={(event) => (state.name = event.target.value)}
          />

          <label ref={inputNoArgRef} for="cars">
            Choose a car:
          </label>

          <select name="cars" id="cars">
            <option value="supra">GR Supra</option>
            <option value="86">GR 86</option>
          </select>
        </>
      )}
      Hello
      {lowerCaseName()}! I can run in React, Qwik, Vue, Solid, or Web Component!
    </div>
  );
}
