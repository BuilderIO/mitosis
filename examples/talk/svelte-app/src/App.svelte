<script lang="ts">
  import { AutoComplete, Todos } from '@builder.io/talk-app-svelte';
  import AutocompleteChild from './AutocompleteChild.svelte';
  import { mockApi } from './mockApi';
</script>

<div>
  <img src="../svelte-logo.png" width={50} />
  {#if window.location.pathname.endsWith('todo')}
    <Todos />
  {:else if window.location.pathname.endsWith('autocomplete')}
    <AutoComplete
      getValues={mockApi}
      renderChild={AutocompleteChild}
      transformData={(x) => x.name}
    />
  {/if}
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
