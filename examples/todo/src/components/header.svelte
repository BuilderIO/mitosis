<script>
  export let name = '';
</script>

<template>
  <h1>
    <slot />
    {name}
  </h1>
</template>
