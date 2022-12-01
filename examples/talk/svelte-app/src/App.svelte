<script lang="ts">
  import { AutoComplete, Todos } from '@builder.io/talk-app-svelte';
  import AutocompleteChild from './AutocompleteChild.svelte';
  import { mockApi } from './mockApi';
</script>

<div>
  <img src="../svelte-logo.png" width={50} alt="svelte logo" />
  {#if window.location.pathname.endsWith('autocomplete')}
    <AutoComplete
      getValues={mockApi}
      renderChild={AutocompleteChild}
      transformData={(x) => x.name}
    />
  {:else}
    <Todos />
  {/if}
</div>
