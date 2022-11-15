<script>
  import Button from './Button.svelte';

  let disabled = false;
</script>

<div>
  <Button type="button" {disabled}><slot /></Button>
</div>
