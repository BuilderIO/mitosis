<template>
  <div class="div-1">
    <h2>Hello, {{ name }}!</h2>
    <input :value="name" @input="name = $event.target.value" />
  </div>
</template>
<script>
export default {
  data: () => ({ name: "Steve" }),
};
</script>
<style>
.div-1 {
  text-align: center;
  color: steelblue;
}
</style>
