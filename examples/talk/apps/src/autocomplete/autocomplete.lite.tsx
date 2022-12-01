import { onUpdate, Show, useStore } from '@builder.io/mitosis';

export type Props = {
  getValues: (input: string) => Promise<any[]>;
  renderChild?: any;
  transformData: (item: any) => string;
};

export default function Example2(props: Props) {
  const state = useStore({
    showSuggestions: false,
    suggestions: [] as any[],

    input: '',

    setInputValue(value: string) {
      state.input = value;
    },

    handleClick(item: any) {
      state.setInputValue(props.transformData(item));
      state.showSuggestions = false;
    },
  });

  onUpdate(() => {
    props.getValues(state.input).then((x) => {
      const filteredX = x.filter((data) => {
        return props.transformData(data).toLowerCase().includes(state.input.toLowerCase());
      });

      state.suggestions = filteredX;
    });
  }, [state.input, props.getValues]);

  return (
    <div css={{ padding: '10px' }}>
      <link
        href="/Users/samijaber/code/work/mitosis/examples/talk/apps/src/tailwind.min.css"
        rel="stylesheet"
      />
      Autocomplete:
      <div class="relative">
        <input
          class="shadow-md rounded w-full px-4 py-2 border border-black"
          value={state.input}
          onChange={(event) => (state.input = event.target.value)}
          onFocus={() => (state.showSuggestions = true)}
        />
        <button
          class="absolute right-4 h-full"
          onClick={() => {
            state.input = '';
            state.showSuggestions = false;
          }}
        >
          X
        </button>
      </div>
      <Show when={state.suggestions.length > 0 && state.showSuggestions}>
        <ul class="shadow-md rounded h-40 overflow-scroll">
          {state.suggestions.map((item) => (
            <li
              class="border-gray-200 border-b flex items-center cursor-pointer hover:bg-gray-100 p-2"
              onClick={() => state.handleClick(item)}
            >
              <Show when={props.renderChild} else={<span>{props.transformData(item)}</span>}>
                <props.renderChild item={item} />
              </Show>
            </li>
          ))}
        </ul>
      </Show>
    </div>
  );
}
