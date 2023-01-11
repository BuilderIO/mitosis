<script>
  let a = 2;
  let b = 5;
  let result;

  $: calculateResult(a, b);

  function calculateResult(a, b) {
    result = a * b;
  }
</script>

<div>
  <input type="number" bind:value={a} />
  <input type="number" bind:value={b} />
  Result: {result}
</div>
