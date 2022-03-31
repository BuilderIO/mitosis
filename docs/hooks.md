**Table of contents**

- [Refs](#refs)
- [onMount](#onmount)
- [onUnMount](#onunmount)
- [onUpdate](#onUpdate)
- [useMetadata](./customizability.md#useMetadata)

## Refs

Use the `useRef` hook to hold a reference to a rendered DOM element.

```jsx
import { useState } from '@builder.io/mitosis';

export default function MyComponent() {
  const state = useState({
    name: 'Steve',
    onBlur() {
      // Maintain focus
      inputRef.focus();
    },
    get lowerCaseName() {
      return state.name.toLowerCase();
    },
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
```

## onMount

The onMount hook is the best place to put custom code to execute once the component mounts.

```jsx
export default function MyComponent() {
  onMount(() => {
    alert('I have mounted!');
  });

  return <div>Hello world</div>;
}
```

## onUnMount

The onUnMount hook is the best place to put any cleanup you need to do when a component is removed

```jsx
export default function MyComponent() {
  onUnMount(() => {
    alert('I have been removed!');
  });

  return <div>Hello world</div>;
}
```

## onUpdate

The onUpdate hook is the best place to put custom code that will either:

- if no `dependencies` array is provided: execute on every render
- if a non-empty `dependencies` array is provided: execute whenever any value in `dependencies` changes

````jsx
export default function OnUpdateWithDeps() {
  const state = useState({
    a: 'a',
    b: 'b',
  });

  onUpdate(() => {
    console.log('Runs on every update/rerender');
  });

  onUpdate(() => {
    console.log('Runs when a or b changes', state.a, state.b);
  }, [state.a, state.b]);

  return <div />;
}```

````
