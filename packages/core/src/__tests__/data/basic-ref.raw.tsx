import { useState, useRef } from '@builder.io/mitosis';

export default function MyMasicRefComponent(props) {
  const [name, setName] = useState('PatrickJS');

  function onBlur() {
    // Maintain focus
    inputRef.focus();
  }

  function lowerCaseName() {
    return name.toLowerCase();
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
            value={name}
            onBlur={(event) => onBlur()}
            onChange={(event) => setName(event.target.value)}
          />
        </>
      )}
      Hello
      {lowerCaseName()}! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
