# Mitosis Overview

Mitosis is a subset of [JSX](https://github.com/facebook/jsx). It supports generating code for a number of frontend frameworks, including React, Vue, Angular, Svelte, and Solid.

**Table of contents**

- [Project Structure](./project-structure.md)
- [Components](./components.md)
- [Hooks](./hooks.md)
- [How Does It Work](#how-does-it-work)
- [Formatting options](#formatting-options)
- [Gotchas](./gotchas.md)

## How does it work

Mitosis uses a static subset of JSX, inspired by [Solid](https://www.solidjs.com/guide#jsx-compilation). This means we can parse it to a simple JSON structure, then easily build serializers that target various frameworks and implementations.

```tsx
export function MyComponent() {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      <input
        value={state.name}
        onChange={(event) => (state.name = event.target.value)}
      />
    </div>
  );
}
```

becomes:

```json
{
  "@type": "@builder.io/mitosis/component",
  "state": {
    "name": "Steve"
  },
  "nodes": [
    {
      "@type": "@builder.io/mitosis/node",
      "name": "div",
      "children": [
        {
          "@type": "@builder.io/mitosis/node",
          "bindings": {
            "value": "state.name",
            "onChange": "state.name = event.target.value"
          }
        }
      ]
    }
  ]
}
```

Which can be reserialized into many languges and frameworks. For example, to support angular, we just make a serializer that loops over the json and produces:

```ts
@Component({
  template: `
    <div>
      <input [value]="name" (change)="name = $event.target.value" />
    </div>
  `,
})
class MyComponent {
  name = 'Steve';
}
```

Adding framework support is surprisingly easy with the plugin system (docs coming soon).

## Formatting options

Mitosis supports settings for generating code to match your preferred formatting, libraries, etc. These output options will be customizable and extensible with plugins soon.

<img src="https://imgur.com/hWXfNF3.gif "/>
