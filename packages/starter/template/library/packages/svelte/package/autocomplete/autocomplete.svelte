<script context="module"></script>

<script>export let transformData;
export let renderChild;
export let getValues;
function setInputValue(value) {
    input = value;
}
function handleClick(item) {
    setInputValue(transformData(item));
    showSuggestions = false;
}
let showSuggestions = false;
let suggestions = [];
let input = "";
function onUpdateFn_0() {
    getValues(input).then((x) => {
        const filteredX = x.filter((data) => {
            return transformData(data).toLowerCase().includes(input.toLowerCase());
        });
        suggestions = filteredX;
    });
}
$: onUpdateFn_0(...[input, getValues]);
</script>

<div class="div">
  <link
    href="/Users/samijaber/code/work/mitosis/examples/talk/apps/src/tailwind.min.css"
    rel="stylesheet"
  />
  Autocomplete:
  <div class="relative">
    <input
      class="shadow-md rounded w-full px-4 py-2 border border-black"
      on:focus={(event) => {
        showSuggestions = true;
      }}
      bind:value={input}
    />
    <button
      class="absolute right-4 h-full"
      on:click={(event) => {
        input = "";
        showSuggestions = false;
      }}
    >
      X
    </button>
  </div>

  {#if suggestions.length > 0 && showSuggestions}
    <ul class="shadow-md rounded h-40 overflow-scroll">
      {#each suggestions as item}
        <li
          class="border-gray-200 border-b flex items-center cursor-pointer hover:bg-gray-100 p-2"
          on:click={(event) => {
            handleClick(item);
          }}
        >
          {#if renderChild}
            <svelte:component this={renderChild} {item} />
          {:else}
            <span>{transformData(item)}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .div {
    padding: 10px;
  }
</style>