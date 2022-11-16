<script>
  function log(msg = 'hello') {
    console.log(msg);
  }
</script>

<div>
  <button on:click={(a) => log('hi')}>Log</button>
  <button on:click={log}>Log</button>
  <button on:click={log()}>Log</button>
</div>
