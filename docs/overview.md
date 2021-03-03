# JSX Lite Overview

JSX Lite is a subset of [JSX](https://github.com/facebook/jsx). It supports generating code for a number of frontend frameworks, including React, Vue, Angular, Svelte, and Solid.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of contents**

- [At a glance](#at-a-glance)
- [Components](#components)
- [Styling](#styling)
- [State](#state)
- [Methods](#methods)
- [Control flow](#control-flow)
  - [Show](#show)
  - [For](#for)
- [Refs](#refs)
- [onMount](#onmount)
- [onUnMount](#onunmount)
- [Gotchas and limitations](#gotchas-and-limitations)
  - [Defining variables with the same name as a state property will shadow it](#defining-variables-with-the-same-name-as-a-state-property-will-shadow-it)
  - [Async methods can't be defined on "state"](#async-methods-cant-be-defined-on-state)
  - [Callback implicitly have an "event" arg](#callback-implicitly-have-an-event-arg)
  - [Functions can't be passed by reference to JSX callbacks](#functions-cant-be-passed-by-reference-to-jsx-callbacks)
  - [Can't assign to "params" to "state"](#cant-assign-to-params-to-state)
  - [Can't destructure assignment from state](#cant-destructure-assignment-from-state)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## At a glance

JSX Lite is inspired by many modern frameworks. You'll see components look like React components and use React-like hooks, but have simple mutable state like Vue, use a static form of JSX like Solid, compile away like Svelte, and uses a simple, prescriptive structure like Angular.

An example JSX Lite component showing several features:

```javascript
import { For, Show, useState } from '@jsx-lite/core';

export default function MyComponent(props) {
  const state = useState({
    newItemName: 'New item',
    list: ['hello', 'world'],
    addItem() {
      state.list = [...state.list, state.newItemName];
    },
  });

  return (
    <div>
      <Show when={props.showInput}>
        <input
          value={state.newItemName}
          onChange={(
            event,
          ) => (state.newItemName = event.target.value)}
        />
      </Show>
      <div css={{ padding: '10px' }}>
        <button onClick={() => state.addItem()}>Add list item</button>
        <div>
          <For each={state.list}>{(item) => <div>{item}</div>}</For>
        </div>
      </div>
    </div>
  );
}
```

## Components

JSX Lite is component-driven like most modern frontend frameworks. Each JSX Lite component should be in its own file and be the single default export. They are simple functions that return JSX elements

```jsx
export default function MyComponent() {
  return <div>Hello world!</div>;
}
```

## Styling

Styling is done via the `css` prop on dom elements and components. It takes CSS properties in `camelCase` (like the `style` object on DOM elements) and properties as valid CSS strings

```javascript
export default function CSSExample() {
  return <div css={{ marginTop: '10px', color: 'red' }} />;
}
```

You can also include media queries as keys, with values as style objects

```javascript
export default function ResponsiveExample() {
  return (
    <div
      css={{
        marginTop: '10px',
        '@media (max-width: 500px)': {
          marginTop: '0px',
        },
      }}
    />
  );
}
```

## State

State is provided by the `useState` hook. Currently, the name of this value must be `state` like below:

```jsx
export default function MyComponent() {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      <h2>Hello, {state.name}</h2>
      <input
        onInput={(event) => (state.name = event.target.value)}
        value={state.name}
      />
    </div>
  );
}
```

Components automatically update when state values change

## Methods

The state object can also take methods.

```jsx
export default function MyComponent() {
  const state = useState({
    name: 'Steve',
    updateName(newName) {
      state.name = newName;
    },
  });

  return (
    <div>
      <h2>Hello, {state.name}</h2>
      <input
        onInput={(event) => state.updateName(event.target.value)}
        value={state.name}
      />
    </div>
  );
}
```

## Control flow

Control flow in Builder is static like [Solid](https://github.com/ryansolid/solid). Instead of using freeform javascript like in React, you must use control flow components like `<Show>` and `<For>`

### Show

Use `<Show>` for conditional logic. It takes a singular `when` prop for a condition to match for. When the condition is truthy, the children will render, otherwise they will not

```jsx
export default function MyComponent(props) {
  return <Show when={props.showContents}>Hello, I may or may not show!</Show>;
}
```

### For

Use `<For>` for repeating items, for instance mapping over an array. It takes a singular `each` prop for the array to iterate over. This component takes a singular function as a child that it passes the relevant item and index to, like below:

```jsx
export default function MyComponent(props) {
  const state = useState({
    myArray: [1, 2, 3],
  });
  return (
    <For each={state.myArray}>
      {(theArrayItem, index) => <div>{theArrayItem}</div>}
    </Show>
  );
}
```

## Refs

Use the `useRef` hook to hold a reference to a rendered DOM element.

```jsx
import { useState } from '@jsx-lite/core';

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

## Gotchas and limitations

### Defining variables with the same name as a state property will shadow it

_JSX Lite input_

```typescript
export default function MyComponent() {
  const state = useState({
    foo: 'bar',

    doSomething() {
      const foo = state.foo;
    },
  });
}
```

_JSX Lite output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  const [foo, setFoo] = useState(() => 'bar');
  function doSomething() {
    const foo = foo;
  }

  return <></>;
}
```

**Work around**

Use a different variable name

_JSX Lite input_

```typescript
export default function MyComponent() {
  const state = useState({
    foo: 'bar',

    doSomething() {
      const foo_ = state.foo;
    },
  });
}
```

_JSX Lite output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  const [foo, setFoo] = useState(() => 'bar');
  function doSomething() {
    const foo_ = foo;
  }

  return <></>;
}
```

### Async methods can't be defined on "state"

_JSX Lite input_

```typescript
export default function MyComponent() {
  const state = useState({
    async doSomethingAsync(event) {
      //  ^^^^^^^^^^^^^^^^^^^^^^^^^
      //  Fails to parse this line
      return;
    },
  });
}
```

**Work around**

You can either:

a. Use promises in this context instead or
b. Use an immediately invoked async function

_JSX Lite input_

```typescript
export default function MyComponent() {
  const state = useState({
    doSomethingAsync(event) {
      void async function() {
        const response = await fetch(); /* ... */
      }();
    },
  });
}
```

_JSX Lite output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  function doSomethingAsync(event) {
    void (async function() {
      const response = await fetch();
    })();
  }

  return <></>;
}
```

### Callback implicitly have an "event" arg

Regardless of what you make name the argument to a callback, it will be
renamed in the output to `event`.

_JSX Lite input_

```typescript
export default function MyComponent() {
  return <input onClick={(e) => myCallback(e)} />;
}
```

_JSX Lite output_

```typescript
export default function MyComponent(props) {
  return (
    <>
      <input
        onClick={(event) => {
          myCallback(e);
        }}
      />
    </>
  );
}
```

### Functions can't be passed by reference to JSX callbacks

_JSX Lite input_

```typescript
export default function MyComponent() {
  const state = useState({
    myCallback(event) {
      // do something
    },
  });

  return <input onClick={state.myCallback} />;
}
```

_JSX Lite output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  function myCallback(event) {
    // do something
  }

  return (
    <>
      <input
        onClick={(event) => {
          myCallback;
        }}
      />
    </>
  );
}
```

**Work around**

Define an anonymous function in the callback

_JSX Lite input_

```typescript
export default function MyComponent() {
  const state = useState({
    myCallback(event) {
      // do something
    },
  });

  return <input onClick={(event) => state.myCallback(event)} />;
}
```

_JSX Lite output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  function myCallback(event) {
    // do something
  }

  return (
    <>
      <input
        onClick={(event) => {
          myCallback(event);# JSX Lite Overview

JSX Lite is a subset of [JSX](https://github.com/facebook/jsx). It supports generating code for a number of frontend frameworks, including React, Vue, Angular, Svelte, and Solid.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of contents**

- [At a glance](#at-a-glance)
- [Components](#components)
- [Styling](#styling)
- [State](#state)
- [Methods](#methods)
- [Control flow](#control-flow)
  - [Show](#show)
  - [For](#for)
- [Refs](#refs)
- [onMount](#onmount)
- [onUnMount](#onunmount)
- [Gotchas and limitations](#gotchas-and-limitations)
  - [Defining variables with the same name as a state property will shadow it](#defining-variables-with-the-same-name-as-a-state-property-will-shadow-it)
  - [Async methods can't be defined on "state"](#async-methods-cant-be-defined-on-state)
  - [Callback implicitly have an "event" arg](#callback-implicitly-have-an-event-arg)
  - [Functions can't be passed by reference to JSX callbacks](#functions-cant-be-passed-by-reference-to-jsx-callbacks)
  - [Can't assign to "params" to "state"](#cant-assign-to-params-to-state)
  - [Can't destructure assignment from state](#cant-destructure-assignment-from-state)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## At a glance

JSX Lite is inspired by many modern frameworks. You'll see components look like React components and use React-like hooks, but have simple mutable state like Vue, use a static form of JSX like Solid, compile away like Svelte, and uses a simple, prescriptive structure like Angular.

An example JSX Lite component showing several features:

```javascript
import { For, Show, useState } from '@jsx-lite/core';

export default function MyComponent(props) {
    return <></>;
}
```
