<script>
  import { getComponentForPath } from '@builder.io/example-apps/svelte';

  const Component = getComponentForPath(window.location.pathname);
</script>

<div>
  <img src="../svelte-logo.png" width={50} />
  <svelte:component this={Component} />
</div>

<style>
  .container {
    display: flex;
    height: 100vh;
  }
  .container div {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
