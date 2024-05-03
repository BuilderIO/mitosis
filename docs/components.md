**Table of contents**

- [At a glance](#at-a-glance)
- [Components](#components)
- [Styling](#styling)
  - [`css`](#css)
- [`class` vs `className`](#class-vs-classname)
- [State](#state)
- [Methods](#methods)
- [Control flow](#control-flow)
  - [Show](#show)
  - [For](#for)
  - [Children](#children)
  - [Slot](#slot)
  - [Default Slot content](#default-slot-content)

## At a glance

Mitosis is inspired by many modern frameworks. You'll see components look like React components and use React-like hooks, but have simple mutable state like Vue, use a static form of JSX like Solid, compile away like Svelte, and uses a simple, prescriptive structure like Angular.

An example Mitosis component showing several features:

```tsx
import { For, Show, useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
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

```tsx
export default function MyComponent() {
  return <div>Hello world!</div>;
}
```

## Styling

### `css`

Styling is done via the `css` prop on dom elements and components. It takes CSS properties in `camelCase` (like the `style` object on DOM elements) and properties as valid CSS strings

```tsx
export default function CSSExample() {
  return <div css={{ marginTop: '10px', color: 'red' }} />;
}
```

You can also include media queries as keys, with values as style objects

```tsx
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

## `class` vs `className`

Mitosis prefers that you use `class` to provide class name strings, but it also allows you to provide `className`. If both are used in the same component, it will attempt to merge the two. We recommend that you only use one (preferrably `class`, as that's what is internally preferred by Mitosis).

## State

State is provided by the `useStore` hook. Currently, the name of this value must be `state` like below:

```tsx
export default function MyComponent() {
  const state = useStore({
    name: 'Steve',
  });

  return (
    <div>
      <h2>Hello, {state.name}</h2>
      <input onInput={(event) => (state.name = event.target.value)} value={state.name} />
    </div>
  );
}
```

If the initial state value is a computed value (whether based on `props` or the output of some function), then you cannot inline it. Instead, use a getter method:

```tsx
import { kebabCase } from 'lodash';

export default function MyComponent(props) {
  const state = useStore({
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
      <input onInput={(event) => (state.name = event.target.value)} value={state.name} />
    </div>
  );
}
```

Components automatically update when state values change

## Methods

The state object can also take methods.

```tsx
export default function MyComponent() {
  const state = useStore({
    name: 'Steve',
    updateName(newName) {
      state.name = newName;
    },
  });

  return (
    <div>
      <h2>Hello, {state.name}</h2>
      <input onInput={(event) => state.updateName(event.target.value)} value={state.name} />
    </div>
  );
}
```

## Control flow

Control flow in Builder is static like [Solid](https://github.com/ryansolid/solid). Instead of using freeform javascript like in React, you must use control flow components like `<Show>` and `<For>`

### Show

```tsx
export declare function Show<T>(props: {
  when: T | undefined | null | false;
  else?: JSX.Element;
  children?: JSX.Element | null;
}): any;
```

Use `<Show>` for conditional logic. It takes a singular `when` prop for a condition to match for. When the condition is truthy, the children will render, the `else` otherwise they will not.

```tsx
export default function MyComponent(props) {
  return (
    <>
      <Show when={props.showContents} else={<span {...props.attributes}>{props.text}</span>}>
        Hello, I may or may not show!
      </Show>
      ;
    </>
  );
}
```

### For

Use `<For>` for repeating items, for instance mapping over an array. It takes a singular `each` prop for the array to iterate over. This component takes a singular function as a child that it passes the relevant item and index to, like below:

```tsx
export default function MyComponent(props) {
  const state = useStore({
    myArray: [1, 2, 3],
  });
  return <For each={state.myArray}>{(theArrayItem, index) => <div>{theArrayItem}</div>}</For>;
}
```

### Children

We use the standard method for passing children with `props.children`

```tsx
export default function MyComponent(props) {
  return <div>{props.children}</div>;
}
```

<details>
  <summary>For <strong>Web Component</strong> you need to use ShadowDom metadata</summary>

```tsx
import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  isAttachedToShadowDom: true,
});
export default function MyComponent(props) {
  return <div>{props.children}</div>;
}
```

</details>

### Slot

When you want to register a named slot you do so using a prop.

```tsx
<div>
  <Layout
    top={<NavBar/>}
    left={<Sidebar/>}
    center={<Content/>}
  />
    anything else
  </Layout>
</div>
```

In this example we are registering `top`, `left`, and `center` for the `Layout` component to project.

If the `Layout` component was also a Mitosis component then we simply use the reference in the props.

```tsx
export default function Layout(props) {
  return (
    <div className="layout">
      <div className="top">{props.top}</div>
      <div className="left">{props.left}</div>
      <div className="center">{props.center}</div>
      {props.children}
    </div>
  );
}
```

or use the Slot component provided by component

```tsx
import { Slot } from '@builder.io/mitosis';

export default function Layout(props) {
  return (
    <div className="layout">
      <div className="top">
        <Slot name="top" />
      </div>
      <div className="left">
        <Slot name="left" />
      </div>
      <div className="center">
        <Slot name="center" />
      </div>
      <Slot />
    </div>
  );
}
```

For vue component a `slot` prop will be compiled into named slot

```html
<div class="layout">
  <div class="top"><slot name="top" /></div>
  <div class="left"><slot name="left" /></div>
  <div class="center"><slot name="center" /></div>
  <slot />
</div>
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

```tsx
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

In webcomponent you need to use ShadowDom metadata for named slots

<details>
  <summary>For <strong>Web Component</strong> you need to use ShadowDom metadata named slots</summary>

```tsx
import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  isAttachedToShadowDom: true,
});
export default function Layout(props) {
  return (
    <div className="layout">
      <div className="top">{props.top}</div>
      <div className="left">{props.left}</div>
      <div className="center">{props.center}</div>
      {props.children}
    </div>
  );
}
```

</details>

### Default Slot content

```tsx
import { Slot } from '@builder.io/mitosis';

export default function Layout(props) {
  return (
    <div className="layout">
      <div className="top">
        <Slot name="top">Top default</Slot>
      </div>
      <div className="left">
        <Slot name="left" />
      </div>
      <div className="center">
        <Slot name="center" />
      </div>
      <Slot>Default child</Slot>
    </div>
  );
}
```
