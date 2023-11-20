<script context="module" lang="ts">
  export interface State {
    list: string[];
    newItemName: string;
    setItemName: any;
    addItem: () => void;
    deleteItem: (k: number) => void;
  }

  export interface TodoAppProps {}
</script>

<script lang="ts">
  import ItemList from "./item-list.svelte";

  function setItemName(event: Event) {
    newItemName = (event.target as any).value;
  }
  function addItem() {
    list = [...list, newItemName];
  }
  function deleteItem(index) {
    list = list.filter((x, i) => i !== index);
  }

  let list = ["hello", "world"];
  let newItemName = "New item";
</script>

<div class="div">
  <link
    href="/Users/samijaber/code/work/mitosis/examples/talk/apps/src/tailwind.min.css"
    rel="stylesheet"
  />
  <input
    class="shadow-md rounded w-full px-4 py-2"
    value={newItemName}
    on:change={(event) => {
      setItemName(event);
    }}
  />{" "}
  <button
    class="bg-blue-500 rounded w-full text-white font-bold py-2 px-4 my-1"
    on:click={(event) => {
      addItem();
    }}
  >
    Add list item
  </button>
  <ItemList {list} {deleteItem} />
</div>

<style>
  .div {
    padding: 10px;
  }
</style>