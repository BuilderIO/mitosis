<script>
  let tortilla = 'Plain';
  let fillings = [];
</script>

<div>
  <!-- grouped radio inputs are mutually exclusive -->
  <input type="radio" bind:group={tortilla} value="Plain" />
  <input type="radio" bind:group={tortilla} value="Whole wheat" />
  <input type="radio" bind:group={tortilla} value="Spinach" />
  <br />
  <br />
  <!-- grouped checkbox inputs populate an array -->
  <input type="checkbox" bind:group={fillings} value="Rice" />
  <input type="checkbox" bind:group={fillings} value="Beans" />
  <input type="checkbox" bind:group={fillings} value="Cheese" />
  <input type="checkbox" bind:group={fillings} value="Guac (extra)" />
  <p>Tortilla: {tortilla}</p>
  <p>Fillings: {fillings}</p>
</div>
