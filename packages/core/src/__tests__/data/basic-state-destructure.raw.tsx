import { useState, onMount, onInit } from '@builder.io/mitosis';

export default function MyBasicComponent() {
  const state = useState({
    name: 'Decadef20',
    sports: [],
  });

  onMount(() => {
    const { name: n, sports } = state;
  });

  onInit(() => {
    const { name } = state,
      sports = state.sports,
      color = 'blue';
    const type = 1;
  });

  return <></>;
}
