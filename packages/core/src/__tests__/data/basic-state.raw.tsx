import { useState, onMount, onInit } from '@builder.io/mitosis';

export default function MyBasicComponent() {
  const state = useState({
    name: 'Decadef20',
    sports: [],
  });

  onMount(() => {
    const n = state.name,
      sports = state.sports;
  });

  onInit(() => {
    const name = state.name,
      sports = state.sports,
      color = 'blue';
    const type = 1;
  });

  return <></>;
}
