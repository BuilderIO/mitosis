<script>
  let name = "Steve";
</script>

<style>
  .div-1 {
    text-align: center;
    color: steelblue;
  }
</style>

<div class="div-1">
  <h2>Hello, {name} !</h2>

  <input bind:value={name} />
</div>
