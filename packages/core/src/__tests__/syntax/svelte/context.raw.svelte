<script>
  import { getContext, setContext } from 'svelte';

  let activeTab = 0;

  let disabled = getContext('disabled');

  setContext('activeTab', activeTab);
</script>

<div>
  {activeTab}
</div>
