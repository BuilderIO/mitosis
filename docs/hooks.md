**Table of contents**

- [useRef](#useref)
  - [forwardRef for React](#forwardref-for-react)
- [useStyle](#usestyle)
- [onInit](#oninit)
- [onMount](#onmount)
- [onUnMount](#onunmount)
- [onUpdate](#onupdate)
- [useMetadata](./customizability.md#useMetadata)
- [useDefaultProps](#usedefaultprops)

## useRef

Use the `useRef` hook to hold a reference to a rendered DOM element.

```tsx
import { Show, useRef, useStore } from '@builder.io/mitosis';

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

### forwardRef for React

<details>

In React you may need to wrap your component with `forwardRef` to provide direct access to an element (`input` for example). You can do this by using using a `prop` value as the `ref`

_Mitosis input_

```tsx
export default function MyInput(props) {
  return <input ref={props.inputRef} />;
}
```

_Mitosis output_

```tsx
import { forwardRef } from 'react';

export default forwardRef(function MyInput(props, inputRef) {
  return <input ref={inputRef} />;
});
```

<hr />
</details>

## useStyle

The useStyle hook can be used to add extra CSS to your component.

```tsx
import { useStyle } from '@builder.io/mitosis';

export default function MyComponent(props) {
  useStyle(`
    button {
      font-size: 12px;
      outline: 1px solid black;
    }
  `);

  return (
    <button
      css={{
        background: 'blue',
        color: 'white',
      }}
      type="button"
    >
      Button
    </button>
  );
}
```

`useStyle` can also be used outside of the component's body:

```tsx
import { useStyle } from '@builder.io/mitosis';

export default function MyComponent(props) {
  return <button type="button">Button</button>;
}

useStyle(`
  button {
    background: blue;
    color: white;
    font-size: 12px;
    outline: 1px solid black;
  }
`);
```

## onInit

The `onInit` hook is the best place to put custom code to execute before the component mounts. It is executed before the `onMount` hook.

```tsx
import { onInit, onMount } from '@builder.io/mitosis';

export default function MyComponent() {
  onInit(() => {
    alert('First: I have init!');
  });

  onMount(() => {
    alert('Second: I have mounted!');
  });

  return <div>Hello world</div>;
}
```

## onMount

The onMount hook is the best place to put custom code to execute once the component mounts.

```tsx
import { onMount } from '@builder.io/mitosis';

export default function MyComponent() {
  onMount(() => {
    alert('I have mounted!');
  });

  return <div>Hello world</div>;
}
```

## onUnMount

The onUnMount hook is the best place to put any cleanup you need to do when a component is removed

```tsx
import { onUnMount } from '@builder.io/mitosis';

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

```tsx
import { onUpdate, useStore } from '@builder.io/mitosis';

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

## useDefaultProps

The `useDefaultProps` hook sets default values for a component's props:

```tsx
import { useDefaultProps } from '@builder.io/mitosis';

export default function Button(props) {
  useDefaultProps({
    text: 'default text',
    link: 'https://builder.io/',
    openLinkInNewTab: false,
    onClick: () => {
      console.log('hi');
    },
  });

  return (
    <div>
      <a href={props.link} target={props.openLinkInNewTab ? '_blank' : undefined}>
        {props.text}
      </a>
      <button onClick={(event) => props.onClick(event)} type="button">
        {props.buttonText}
      </button>
    </div>
  );
}
```

You can also use `useDefaultProps` outside of the component body:

```tsx
import { useDefaultProps } from '@builder.io/mitosis';

useDefaultProps({
  text: 'default text',
});

export default function Button(props) {
  return <span>{props.text}</span>;
}
```
