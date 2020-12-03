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
        newItemName: 'New item',
        addItem() {
          state.list = [...state.list, { text: state.newItemName }]
        }
      });
    
      return (
        <div css={{ padding: '10px' }}>
          <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet" />          
          <input 
            class="shadow-md rounded w-full px-4 py-2"
            value={state.newItemName} 
            onChange={event => state.newItemName = event.target.value} />
          <button 
            class="bg-blue-500 rounded w-full text-white font-bold py-2 px-4 "
            css={{ margin: '10px 0' }} 
            onClick={() => state.addItem()}>
            Add list item
          </button>
          <div class="shadow-md rounded">
            <For each={state.list}>
              {item => (
                <div class="border-gray-200 border-b" css={{ padding: '10px' }}>
                  {item.text}
                </div>
              )}
            </For>
          </div>
        </div>
      );
    }
  `,
};
