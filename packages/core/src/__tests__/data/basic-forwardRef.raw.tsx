import { useState, useRef, useMetadata } from '@builder.io/mitosis';

export interface Props {
  showInput: boolean;
  inputRef: any;
}

export default function MyBasicForwardRefComponent(props: Props) {
  const state = useState({
    name: 'PatrickJS',
  });

  return (
    <div>
      <input
        ref={props.inputRef}
        css={{
          color: 'red',
        }}
        value={state.name}
        onChange={(event) => (state.name = event.target.value)}
      />
    </div>
  );
}
