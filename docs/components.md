**Table of contents**

- [At a glance](#at-a-glance)
- [Components](#components)
- [Styling](#styling)
- [State](#state)
- [Methods](#methods)
- [Control flow](#control-flow)
  - [Show](#show)
  - [For](#for)
  - [Children](#children)
  - [Slot](#slot)

## At a glance

Mitosis is inspired by many modern frameworks. You'll see components look like React components and use React-like hooks, but have simple mutable state like Vue, use a static form of JSX like Solid, compile away like Svelte, and uses a simple, prescriptive structure like Angular.

An example Mitosis component showing several features:

```javascript
import { For, Show, useState } from '@builder.io/mitosis';

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
          onChange={(event) => (state.newItemName = event.target.value)}
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

Mitosis is component-driven like most modern frontend frameworks. Each Mitosis component should be in its own file and be the single default export. They are simple functions that return JSX elements

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

If the initial state value is a computed value (whether based on `props` or the output of some function), then you cannot inline it. Instead, use a getter method:

```jsx
import { kebabCase } from 'lodash';

export default function MyComponent(props) {
  const state = useState({
    name: 'Steve',
    get transformedName() {
      return kebabCase('Steve');
    },
    get transformedName() {
      return props.name;
    },
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
    </For>
  );
}
```

### Children

We use the standard method for passing children with `props.children`

```jsx
function MyComponent(props) {
  return <div>{props.children}</div>;
}
```

### Slot

When you want to register a named slot you do so using the `slot` prop.

```jsx
<div>
  <Layout
    slotTop={<NavBar/>}
    slotLeft={<Sidebar/>}
    slotCenter={<Content/>}
  />
    anything else
  </Layout>
</div>
```

In this example we are registering `top`, `left`, and `center` for the `Layout` component to project.

If the `Layout` component was also a Mitosis component then we simply use the reference in the props.

```jsx
function Layout(props) {
  return (
    <div className="layout">
      <div className="top">{props.slotTop}</div>
      <div className="left">{props.slotLeft}</div>
      <div className="center">{props.slotCenter}</div>
      {props.children}
    </div>
  );
}
```

Mitosis compiles one component at a time and is only concerned with outputting the correct method for each framework. For the two examples above, here are the angular and html outputs.

```html
<div>
  <layout>
    <sidebar left></sidebar>
    <nav-bar top></nav-bar>
    <content center></content>
    anything else
  </layout>
  <div></div>
</div>
```

```javascript
@Component({
  selector: 'layout',
  template: `
    <div class="layout">
      <div class="top">
        <ng-content select="[top]"></ng-content>
      </div>
      <div class="left">
        <ng-content select="[left]"></ng-content>
      </div>
      <div class="center">
        <ng-content select="[center]"></ng-content>
      </div>
      <ng-content></ng-content>
    </div>
  `,
})
class LayoutComponent {}
```
