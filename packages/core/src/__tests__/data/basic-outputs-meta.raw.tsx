import { onMount, useMetadata, useStore } from '@builder.io/mitosis';

useMetadata({
  outputs: ['onMessage', 'onEvent'],
});
export default function MyBasicOutputsComponent(props: any) {
  useMetadata({
    baz: 'metadata inside component',
  });

  const state = useStore({
    name: 'PatrickJS',
  });

  onMount(() => {
    props.onMessageChange(state.name);
    props.onEvent(props.message);
  });

  return <div></div>;
}
