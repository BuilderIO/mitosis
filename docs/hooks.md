**Table of contents**

- [useRef](#useref)
  - [forwardRef for React](#forwardref-for-react)
- [useStyle](#usestyle)
- [onMount](#onmount)
- [onUnMount](#onunmount)
- [onUpdate](#onupdate)
- [useMetadata](./customizability.md#useMetadata)

## useRef

Use the `useRef` hook to hold a reference to a rendered DOM element.

```typescript
import { useStore, useRef, Show } from '@builder.io/mitosis';

export default function MyComponent() {
  const inputRef = useRef<HTMLInputElement>(null);

  const state = useStore({
    name: 'Steve',
    onBlur() {
      // Maintain focus
      inputRef.focus();
    },
    get lowerCaseName() {
      return state.name.toLowerCase();
    },
  });

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

<details>
  <summary><strong>forwardRef</strong> for <strong>React</strong></summary>

In React you may need to wrap your component with `forwardRef` to provide direct access to an element (`input` for example). You can do this by using using a `prop` value as the `ref`

_Mitosis input_

```typescript
export default function MyInput(props) {
  return <input ref={props.inputRef} />;
}
```

_Mitosis output_

```typescript
import { forwardRef } from 'react';

export default forwardRef(function MyInput(props, inputRef) {
  return <input ref={inputRef} />;
});
```

<hr />
</details>

## useStyle

The useStyle hook can be used to add extra CSS to your component.

```jsx
useStyle(`
input:focus {
outline: 1px solid blue;
}
`);
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

```jsx
export default function OnUpdateWithDeps() {
  const state = useStore({
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
}
```
