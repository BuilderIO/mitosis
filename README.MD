<p align="center"><img width="400" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F873aa9bf5d8d4960abbee6d913862e1c"></p>

<p align="center">
  Write JSX once that runs everywhere. Compiles to Vue, React, Solid, Liquid, and more.
</p>

&nbsp;

## Example

**Source:**

```tsx
import { useState } from '@jsx-lite/core';

export function MyComponent() {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      <input
        value={state.name}
        onChange={(e) => (state.name = e.target.value)}
      />
      Hello, {state.name}. I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
```

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fda8f27bf2deb40a886943bf41db07377" />

Or see it in real time:
<img src="https://i.imgur.com/1ZqXv65.gif" />

## How does it work

JSX Lite uses a static subset of JSX, inspired by [Solid](https://github.com/ryansolid/solid/blob/master/documentation/rendering.md). This means we can parse it to a simple JSON structure that it is easy easy to build stringifers off of for various frameworks and implementations

```tsx
export function MyComponent() {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      <input
        value={state.name}
        onChange={(e) => (state.name = e.target.value)}
      />
    </div>
  );
}
```

becomes:

```json
{
  "@type": "@jsx-lite/component",
  "state": {
    "name": "Steve"
  },
  "nodes": [
    {
      "@type": "@jsx-lite/node",
      "name": "div",
      "children": [
        {
          "@type": "@jsx-lite/node",
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

Which can be reserialized into many languges and framworks. For instance, to support angular, we just make a serializer that loops over the json and produces:

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

Adding framework support is surprisingy easy with our plugins (docs coming soon!)

## Why

- **Platform universal code** - your same code components can run in a React app, or a Shopify store liquid template, a native app - you name it.
  - E.g. want to make an open source library but can't choose which framework(s) to support? Write it once in Builder JSX and generate code for all frameworks (React, Vue, Native, Shopify, etc...)
- **Future proof your code** - tired of writing the same UI components for every hot new framework as it comes out? Tired of duplicating components because you need to support multiple frameworks?
  - Write once and generate. New hot fraemework comes out? Write an adapter once and now all your current code supports the new framework
- **Edit visually** - static code subsets like jsx-lite have the ability to also be visually edited, for instance with Builder.io. Share with designers or marketers to create, repurpose, and extend either as code or via an API

<img src="https://i.imgur.com/KTpBDvH.gif" >

## Who uses it

- [Builder.io](https://github.com/builderio/builder)
- [Snap](https://github.com/builderio/snap)
- [HTML to Figma](https://github.com/builderio/html-to-figma) (coming soon)

## Coming soon

- Stable (v1) release
- Plugin API docs for custom syntaxes and extensions
- Integration with design tools like Figma (Figma <-> JSX Lite)
