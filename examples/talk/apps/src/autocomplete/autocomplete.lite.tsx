import { onUpdate, Show, useDefaultProps, useStore } from '@builder.io/mitosis';

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
      console.log('setting input value', value, state.input);
      state.input = value;
      console.log('set input value', state.input);
    },

    handleClick(item: any) {
      console.log('handling click');
      state.setInputValue(props.transformData(item));
      state.showSuggestions = false;
    },
  });

  onUpdate(() => {
    props.getValues(state.input).then((x) => {
      state.suggestions = x;
    });
  }, [state.input, props.getValues]);

  // http://universities.hipolabs.com/search?country=United+Kingdom
  return (
    <div css={{ padding: '10px' }}>
      <link
        href="/Users/samijaber/code/work/mitosis/examples/talk/apps/src/tailwind.min.css"
        rel="stylesheet"
      />
      Autocomplete:
      <input
        class="shadow-md rounded w-full px-4 py-2"
        value={state.input}
        onChange={(event) => (state.input = event.target.value)}
        onFocus={() => (state.showSuggestions = true)}
      />{' '}
      <Show when={state.suggestions.length > 0 && state.showSuggestions}>
        <ul class="shadow-md rounded">
          {state.suggestions.map((item) => (
            <li
              class="border-gray-200 border-b flex items-center cursor-pointer hover:bg-gray-100"
              css={{
                padding: '10px',
              }}
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
