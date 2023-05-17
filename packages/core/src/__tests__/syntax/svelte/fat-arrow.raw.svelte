<script>
  const clickHandler1 = (event) => { console.log("do something 1") }

  function clickHandler2(event) { console.log("do something 2"); }
</script>

<button on:click={clickHandler1}>Button 1</button>
<button on:click={clickHandler2}>Button 2</button>
