<script>
  let name = 'Steve';

  $: lowercaseName = name.toLowerCase();
</script>

<div>
  <input value={name} />
  Lowercase: {lowercaseName}
</div>
