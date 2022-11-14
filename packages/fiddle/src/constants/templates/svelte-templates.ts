import dedent from 'dedent';

export const defaultCode = dedent`
  <script>
    let name = 'Steve';
  </script>

  <div>
    <input bind:value={name} />
    Hello! I can run in React, Vue, Solid, or Liquid!
  </div>
`;

export const templates: { [key: string]: string } = {
  basic: defaultCode,
  textExpressions: dedent`
  <script>
    let a = 5;
    let b = 12;
  </script>

  <div>
    normal:
    { a + b} 
    <br>
    conditional
    { a > 2 ? 'hello' : 'bye'}
  </div>
`,
  reactive: dedent`
    <script>
      let name = "Steve"

      $: lowercaseName = name.toLowerCase();
    </script>

    <div>
      <input value={name} />
      Lowercase: {lowercaseName}
    </div>

  `,

  'if / else': dedent`
    <script>
      let show = true;

      function toggle() {
        show = !show;
      }
    </script>

    {#if show}
      <button on:click={toggle}>
        Hide
      </button>
    {:else}
      <button on:click={toggle}>
        Show
      </button>
    {/if}
  `,
  each: dedent`
  <script>
    let numbers = ['one', 'two', 'three'];
  </script>

  <ul>
    {#each numbers as num}
      <li>{num}</li>
    {/each}
  </ul>
  `,
  'lifecycle hooks': dedent`
  <script>
    import { onMount, onDestroy, onAfterUpdate } from 'svelte';

    onMount(() => {
      console.log('onMount');
    });
    
    onDestroy(() => {
      console.log('onDestroy');
    });

    onAfterUpdate(() => {
      console.log('onAfterUpdate');
    });
  </script>

  <div></div>
  `,
  imports: dedent`
  <script>
    import Button from './Button.svelte';

    let disabled = false;
  </script>

  <div>
    <Button type="button" disabled={disabled}><slot/></Button>
  </div>
  `,
  '@html': dedent`
  <script>
    let html = '<b>bold</b>'
  </script>

  <div>
    {@html html}
  </div>
  `,
  context: dedent`
  <script>
    import { getContext, setContext } from 'svelte';

    let activeTab = 0;

    let disabled = getContext('disabled');

    setContext('activeTab', activeTab)
  </script>

  <div>
    {activeTab}
  </div>
  `,
  'class directive': dedent`
  <script>
    export let disabled = false;
    let focus = true;
  </script>
  
  <input class="form-input" class:disabled class:focus />
  `,
  style: dedent`
  <script>
  </script>
  
  <input class="form-input"/>
  
  <style>
    input {
      color: red;
      font-size: 12px;
    }
    
    .form-input:focus {
      outline: 1px solid blue;
    }
  </style>
  `,
  'bind:group': dedent`
  <script>
    let tortilla = 'Plain';
    let fillings = [];
  </script>
  <div>
    <!-- grouped radio inputs are mutually exclusive -->
    <input type="radio" bind:group={tortilla} value="Plain">
    <input type="radio" bind:group={tortilla} value="Whole wheat">
    <input type="radio" bind:group={tortilla} value="Spinach">
    <br>
    <br>
    <!-- grouped checkbox inputs populate an array -->
    <input type="checkbox" bind:group={fillings} value="Rice">
    <input type="checkbox" bind:group={fillings} value="Beans">
    <input type="checkbox" bind:group={fillings} value="Cheese">
    <input type="checkbox" bind:group={fillings} value="Guac (extra)">
    <p>Tortilla: {tortilla}</p>
    <p>Fillings: {fillings}</p>
  </div>
  `,
  'bind:property': dedent`
      <script>
      let value = 'hello';
    </script>

    <input {value} />
  `,
};
