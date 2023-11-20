<script context="module"></script>

<script>export let list;
export let deleteItem;
</script>

<ul class="shadow-md rounded">
  {#each list as item}
    <li class="border-gray-200 border-b flex items-center p-2.5">
      <span>{item}</span>
      <button
        class="bg-red-500 rounded text-white py-2 px-4 ml-auto"
        on:click={(event) => {
          deleteItem(list.indexOf(item));
        }}
      >
        Delete
      </button>
    </li>
  {/each}
</ul>