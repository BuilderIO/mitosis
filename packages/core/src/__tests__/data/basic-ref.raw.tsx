import { useState, useRef } from '@builder.io/mitosis';

export interface Props {
  showInput: boolean;
}

export default function MyMasicRefComponent(props: Props) {
  const state = useState({
    name: 'PatrickJS',
  });

  function onBlur() {
    // Maintain focus
    inputRef.focus();
  }

  function lowerCaseName() {
    return state.name.toLowerCase();
  }

  const inputRef = useRef();

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
        </>
      )}
      Hello
      {lowerCaseName()}! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
