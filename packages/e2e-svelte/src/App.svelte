<script lang="ts">
  // Svelte components *can* be consumed in source form (as Mitosis currenlty
  // provides), but it is not recommended:
  // https://github.com/sveltejs/component-template/issues/29#issuecomment-905481560

  //@ts-ignore
  import MyComponent from '@builder.io/e2e-app/svelte/components/my-component.svelte';
</script>

<MyComponent></MyComponent>
