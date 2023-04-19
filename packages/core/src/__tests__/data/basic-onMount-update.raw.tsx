import { onInit, onMount, useStore } from '@builder.io/mitosis';

export interface Props {
  hi: string;
  bye: string;
}

export default function MyBasicOnMountUpdateComponent(props: Props) {
  const state = useStore({
    name: 'PatrickJS',
    names: ['Steve', 'PatrickJS'],
  });

  onInit(() => {
    state.name = 'PatrickJS onInit' + props.hi;
  });

  onMount(() => {
    state.name = 'PatrickJS onMount' + props.bye;
  });

  return <div>Hello {state.name}</div>;
}
