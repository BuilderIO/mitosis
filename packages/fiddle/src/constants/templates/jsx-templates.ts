import dedent from 'dedent';

export const defaultCode = dedent`
  import { useState } from "@builder.io/mitosis";

  export default function MyComponent(props) {
    const [name, setName] = useState("Steve");

    return (
      <div>
        <input
          css={{
            color: "red",
          }}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        Hello! I can run in React, Vue, Solid, or Liquid!
      </div>
    );
  }
`;

export const templates: { [key: string]: string } = {
  basic: dedent`
    import { useStore } from "@builder.io/mitosis";
    
    export default function MyComponent(props) {
      const state = useStore({
        name: "Steve"
      });
      
      return (
        <div>
          <input
            css={{
              color: "red",
            }}
            value={state.name}
            onChange={(event) => { state.name = event.target.value }}
          />
          Hello
          {state.name}! I can run in React, Vue, Solid, or Liquid!
        </div>
      );
    }
  `,

  tailwind: dedent`
    import { useStore } from "@builder.io/mitosis";

    export default function MyComponent(props) {
      const state = useStore({
        name: "Steve"
      });


      return (
        <div
          css={{
            padding: "10px",
          }}
        >
          <link
            href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
            rel="stylesheet"
          />

          <input
            class="shadow-md rounded w-full px-4 py-2"
            placeholder="What is your name?"
            value={state.name}
            onChange={(event) => { state.name = event.target.value }}
          />

          <h1
            class="text-lg"
            css={{
              marginTop: "10px",
            }}
          >
            Hello,
            {state.name}!
          </h1>
        </div>
      );
    }
  `,

  'methods and refs': dedent`
    import { useStore, useRef } from "@builder.io/mitosis";
    
    export default function MyComponent(props) {
      const inputRef: HTMLInputElement = useRef();

      const state = useStore({
        name: "Steve",
        onBlur() {
          inputRef.focus()
        },
        get lowerCaseName() {
          return state.name.toLowerCase();
        }
      });

    
    
      return (
        <div>
          {props.showInput && (
            <input
              ref={inputRef}
              css={{
                color: "red",
              }}
              value={state.name}
              onBlur={(event) => state.onBlur()}
              onChange={(event) => { state.name = event.target.value }}
            />
          )}
          Hello
          {state.lowerCaseName}! I can run in React, Vue, Solid, or Liquid!
        </div>
      );
    }
  `,
  loop: dedent`
    import { useStore } from "@builder.io/mitosis";
    
    export default function MyComponent(props) {
      const state = useStore({
        list: ["hello", "world"],
        newItemName: "New item",
        addItem() {
          state.list = [
            ...state.list, 
            state.newItemName,
          ]
        }
      })
    
      return (
        <div
          css={{
            padding: "10px",
          }}
        >
          <link
            href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
            rel="stylesheet"
          />
    
          <input
            class="shadow-md rounded w-full px-4 py-2"
            value={state.newItemName}
            onChange={(event) => {state.newItemName = event.target.value}}
          />
    
          <button
            class="bg-blue-500 rounded w-full text-white font-bold py-2 px-4 "
            css={{
              margin: "10px 0",
            }}
            onClick={(event) => state.addItem()}
          >
            Add list item
          </button>
    
          <div class="shadow-md rounded">
            {state.list.map((item) => (
              <div
                class="border-gray-200 border-b"
                css={{
                  padding: "10px",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );
    }
  `,
};
