import { useState, onInit, onMount } from '@builder.io/mitosis';

export default function MyBasicOnMountUpdateComponent(props) {
  const state = useState({
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
