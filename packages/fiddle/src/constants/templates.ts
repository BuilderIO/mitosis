import dedent from 'dedent';

export const defaultCode = dedent`
  import { useState } from '@jsx-lite/core';

  export default function MyComponent(props) {
    const state = useState({
      name: 'Steve'
    });

    return (
      <div>
        <Show when={props.showInput}>
          <input
            css={{ color: 'red' }}
            value={state.name}
            onChange={(event) => (state.name = event.target.value)}
          />
        </Show>
        Hello! I can run in React, Vue, Solid, or Liquid!
      </div>
    );
  }
`;

export const templates: { [key: string]: string } = {
  basic: dedent`
    import { useState } from '@jsx-lite/core';
    
    export default function MyComponent(props) {
      const state = useState({
        name: 'Steve'
      });
    
      return (
        <div>
          <Show when={props.showInput}>
            <input
              css={{ color: 'red' }}
              value={state.name}
              onChange={(event) => (state.name = event.target.value)}
            />
          </Show>
          Hello {state.name}! I can run in React, Vue, Solid, or Liquid!
        </div>
      );
    }
  `,

  computed: dedent`
    import { useState } from '@jsx-lite/core';

    export default function MyComponent() {
      const state = useState({
        name: 'Steve',
        get lowerCaseName() {
          return state.name.toLowerCase()
        }
      });
    
      return (
        <div>
          <Show when={props.showInput}>
            <input
              value={state.name}
              onChange={(event) => (state.name = event.target.value)}
            />
          </Show>
          Hello {state.lowerCaseName}! I can run in React, Vue, Solid, or Liquid!
        </div>
      );
    }
  `,
  'methods and refs': dedent`
    import { useState } from '@jsx-lite/core';

    export default function MyComponent() {
      const state = useState({
        name: 'Steve',
        onBlur() {
          // Maintain focus
          inputRef.focus()
        },
        get lowerCaseName() {
          return state.name.toLowerCase()
        }
      });

      const inputRef = useRef();
    
      return (
        <div>
          <Show when={props.showInput}>
            <input
              ref={inputRef}
              css={{ color: 'red' }}
              value={state.name}
              onBlur={() => state.onBlur()}
              onChange={(event) => (state.name = event.target.value)}
            />
          </Show>
          Hello {state.lowerCaseName}! I can run in React, Vue, Solid, or Liquid!
        </div>
      );
    }
  `,
  loop: dedent`
    import { useState, For } from '@jsx-lite/core';

    export default function MyComponent() {
      const state = useState({
        list: [{ text: 'hello' }, { text: 'world' }],
        addItem() {
          state.list = [...state.list, { text: '!' }]
        }
      });
    
      return (
        <div>
          <For each={state.list}>
            {item => (
              <div css={{ padding: '10px' }}>
                {item.text}
              </div>
            )}
          </For>
          <button 
            css={{ padding: '10px' }} 
            onClick={() => state.addItem()}>
            Add list item
          </button>
        </div>
      );
    }
  `,
};
