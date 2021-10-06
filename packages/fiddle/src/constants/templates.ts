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
          Hello
          {name}! I can run in React, Vue, Solid, or Liquid!
        </div>
      );
    }
  `,

  tailwind: dedent`
    import { useState } from "@builder.io/mitosis";

    export default function MyComponent(props) {
      const [name, setName] = useState("Steve");

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
            className="shadow-md rounded w-full px-4 py-2"
            placeholder="What is your name?"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <h1
            className="text-lg"
            css={{
              marginTop: "10px",
            }}
          >
            Hello,
            {name}!
          </h1>
        </div>
      );
    }
  `,

  'methods and refs': dedent`
    import { useState, useRef } from "@builder.io/mitosis";
    
    export default function MyComponent(props) {
      const [name, setName] = useState("Steve");
    
      function onBlur() {
        // Maintain focus
        inputRef.current.focus();
      }
    
      function lowerCaseName() {
        return name.toLowerCase();
      }
    
      const inputRef = useRef();
    
      return (
        <div>
          {props.showInput && (
            <>
              <input
                ref={inputRef}
                css={{
                  color: "red",
                }}
                value={name}
                onBlur={(event) => onBlur()}
                onChange={(event) => setName(event.target.value)}
              />
            </>
          )}
          Hello
          {lowerCaseName()}! I can run in React, Vue, Solid, or Liquid!
        </div>
      );
    }
  `,
  loop: dedent`
    import { useState } from "@builder.io/mitosis";
    
    export default function MyComponent(props) {
      const [list, setList] = useState(["hello", "world"]);
    
      const [newItemName, setNewItemName] = useState("New item");
    
      function addItem() {
        setList([...list, newItemName]);
      }
    
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
            className="shadow-md rounded w-full px-4 py-2"
            value={newItemName}
            onChange={(event) => setNewItemName(event.target.value)}
          />
    
          <button
            className="bg-blue-500 rounded w-full text-white font-bold py-2 px-4 "
            css={{
              margin: "10px 0",
            }}
            onClick={(event) => addItem()}
          >
            Add list item
          </button>
    
          <div className="shadow-md rounded">
            {list.map((item) => (
              <div
                className="border-gray-200 border-b"
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
