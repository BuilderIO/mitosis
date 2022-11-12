<script>
  let show = true;

  function toggle() {
    show = !show;
  }
</script>

{#if show}
  <button on:click={toggle}> Hide </button>
{:else}
  <button on:click={toggle}> Show </button>
{/if}
