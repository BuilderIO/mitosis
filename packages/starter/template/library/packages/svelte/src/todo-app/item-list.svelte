<script context="module" lang="ts">
  export interface ItemListProps {
    list: string[];
    deleteItem: (k: number) => void;
  }
</script>

<script lang="ts">
  export let list: ItemListProps["list"];
  export let deleteItem: ItemListProps["deleteItem"];
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