import { For, onUpdate, Show, useStore } from '@builder.io/mitosis';

export type Props = {
  getValues?: (input: string) => Promise<any[]>;
  renderChild?: any;
  transformData?: (item) => string;
};

export default function AutoComplete(props: Props) {
  const state = useStore({
    showSuggestions: false,
    suggestions: [] as any[],

    inputVal: '',

    setInputValue(value: string) {
      state.inputVal = value;
    },

    handleClick(item) {
      state.setInputValue(state.transform(item));
      state.showSuggestions = false;
    },

    fetchVals(city: string) {
      if (props.getValues) {
        return props.getValues(city);
      }
      return fetch(
        `http://universities.hipolabs.com/search?name=${city}&country=united+states`,
      ).then((x) => x.json());
    },

    transform(x) {
      return props.transformData ? props.transformData(x) : x.name;
    },
  });

  onUpdate(() => {
    state.fetchVals(state.inputVal).then((newVals) => {
      if (!newVals?.filter) {
        console.error('Invalid response from getValues:', newVals);

        return;
      }
      state.suggestions = newVals.filter((data) =>
        state.transform(data).toLowerCase().includes(state.inputVal.toLowerCase()),
      );
    });
  }, [state.inputVal, props.getValues]);

  return (
    <div css={{ padding: '10px', maxWidth: '700px' }}>
      Autocomplete:
      <div css={{ position: 'relative', display: 'flex', gap: '16px', alignItems: 'stretch' }}>
        <input
          css={{
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            borderRadius: '0.25rem',
            borderWidth: '1px',
            borderColor: '#000000',
            width: '100%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
          value={state.inputVal}
          onChange={(event) => (state.inputVal = event.target.value)}
          onFocus={() => (state.showSuggestions = true)}
          placeholder="Search for a U.S. university"
        />
        <button
          onClick={() => {
            state.inputVal = '';
            state.showSuggestions = false;
          }}
          css={{
            cursor: 'pointer',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            borderRadius: '0.25rem',
            color: '#ffffff',
            backgroundColor: '#EF4444',
          }}
        >
          X
        </button>
      </div>
      <Show when={state.suggestions.length > 0 && state.showSuggestions}>
        <ul
          css={{
            borderRadius: '0.25rem',
            height: '10rem',
            margin: 'unset',
            padding: 'unset',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          <For each={state.suggestions}>
            {(item, idx) => (
              <li
                key={idx}
                css={{
                  display: 'flex',
                  padding: '0.5rem',
                  alignItems: 'center',
                  borderBottomWidth: '1px',
                  borderColor: '#E5E7EB',
                  cursor: 'pointer',
                  ':hover': { backgroundColor: '#F3F4F6' },
                }}
                onClick={() => state.handleClick(item)}
              >
                <Show when={props.renderChild} else={<span>{state.transform(item)}</span>}>
                  <props.renderChild item={item} />
                </Show>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
