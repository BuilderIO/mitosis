<script context="module" lang="ts">
  export type Props = {
    getValues: (input: string) => Promise<any[]>;
    renderChild?: any;
    transformData: (item: any) => string;
  };
</script>

<script lang="ts">
  export let transformData: Props["transformData"];
  export let renderChild: Props["renderChild"] = undefined;
  export let getValues: Props["getValues"];

  function setInputValue(value: string) {
    input = value;
  }
  function handleClick(item: any) {
    setInputValue(transformData(item));
    showSuggestions = false;
  }

  let showSuggestions = false;
  let suggestions = [];
  let input = "";

  function onUpdateFn_0(..._args: any[]) {
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
    <svelte:component
      this={input}
      class="shadow-md rounded w-full px-4 py-2 border border-black"
      onFocus={(event) => (showSuggestions = true)}
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