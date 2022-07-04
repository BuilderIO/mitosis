/** @jsxImportSource @builder.io/mitosis */

import { onInit, onMount } from '@builder.io/mitosis';

export default function OnInit() {
  onInit(() => {
    console.log('onInit');
  });

  onMount(() => {
    console.log('onMount');
  });

  return <div />;
}
