<script>
  import { onMount, onDestroy, onAfterUpdate } from 'svelte';

  onMount(() => {
    console.log('onMount');
  });

  onDestroy(() => {
    console.log('onDestroy');
  });

  onAfterUpdate(() => {
    console.log('onAfterUpdate');
  });
</script>

<div />
