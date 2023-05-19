import { useMetadata, useStore } from '@builder.io/mitosis';

export interface Props {
  showInput: boolean;
  inputRef: HTMLInputElement;
}

useMetadata({
  forwardRef: 'inputRef',
});
export default function MyBasicForwardRefComponent(props: Props) {
  const state = useStore({
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
