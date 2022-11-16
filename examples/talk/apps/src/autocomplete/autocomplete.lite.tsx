import { onUpdate, Show, useStore } from '@builder.io/mitosis';
import { mockApi } from './mockApi';

export interface State {
  list: string[];
  input: string;
  addItem: () => void;
  deleteItem: (k: number) => void;
  showSuggestions: boolean;
  readonly suggestionsToShow: string[];
}

export type Props = {
  list?: string[] | ((input: string) => Promise<string[]>);
};

export default function Example2(props: Props) {
  const state = useStore({
    showSuggestions: false,
    suggestions: [] as string[],

    input: '',

    setInputValue(value: string) {
      console.log('setting input value', value, state.input);
      state.input = value;
      console.log('set input value', state.input);
    },

    handleClick(item: string) {
      console.log('handling click');
      state.setInputValue(item);
      state.showSuggestions = false;
    },
  });

  onUpdate(() => {
    if (!props.list) {
      // state.suggestions = DEFAULT_LIST.filter((x: string) => x.startsWith(state.input));
      mockApi(state.input).then((x) => {
        const newSug = x.map((k) => k.name);
        state.suggestions = newSug;
      });
    } else if (Array.isArray(props.list)) {
      state.suggestions = props.list.filter((x: string) => x.startsWith(state.input));
    } else {
      // make API call
      mockApi(state.input).then((x) => {
        const newSug = x.map((k) => k.name);
        state.suggestions = newSug;
      });
    }
  }, [state.input, props.list]);

  // http://universities.hipolabs.com/search?country=United+Kingdom
  return (
    <div css={{ padding: '10px' }}>
      <link
        href="/Users/samijaber/code/work/mitosis/examples/talk/apps/src/tailwind.min.css"
        rel="stylesheet"
      />
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
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Show>
    </div>
  );
}
