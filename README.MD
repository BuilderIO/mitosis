<p align="center"><img width="400" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F873aa9bf5d8d4960abbee6d913862e1c"></p>

<p align="center">
  Write components once, run everywhere. Compiles to Vue, React, Solid, and Liquid. Import code from Figma and Builder.io
</p>

<p align="center">
  <a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" /></a>
  <a href="https://github.com/BuilderIO/jsx-lite/pulls"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
  <a href="https://github.com/BuilderIO/jsx-lite"><img alt="License" src="https://img.shields.io/github/license/BuilderIO/jsx-lite" /></a>
  <a href="https://www.npmjs.com/package/@jsx-lite/core"><img alt="Types" src="https://img.shields.io/npm/types/@jsx-lite/core" /></a>
  <a href="https://www.npmjs.com/package/@jsx-lite/core" rel="nofollow"><img src="https://img.shields.io/npm/v/@jsx-lite/core.svg?sanitize=true"></a>
</p>

## Try it out

Try our early our [alpha preview here](https://jsx-lite.builder.io/) and please [report bugs and share feedback](https://github.com/BuilderIO/jsx-lite/issues)!

<a href="https://jsx-lite.builder.io" target="_blank" rel="noopenner">
<img src="https://imgur.com/H1WTtGe.gif" />
</a>

## Why

### Component libraries

Managing support for libraries that provide UI components across frameworks is a _pain_, esp when webcomponents are not an option (e.g. for server side rendering, best performance, etc). With JSX Lite you can write once, and run everywhere with full compatibilty

### No-code tools

With JSX lite, you can import designs from [Figma](https://github.com/BuilderIO/html-to-figma) or Sketch and convert it to clean code for the framework of your choice. You can even use [Builder.io](https://github.com/builderio/builder) to visually drag/drop to build UIs and edit the code _side by side_

### Modern workflows for all platforms

JSX lite allows you to incrementally adopt modern and familiar workflows for many different platforms, for for Shopify instance you can server side render to liquid and hydrate with React

### JS framework fatigue

If you have ever had to migrate a huge codebase from one framework to another, it's an absolute nightmare. Writing at a higher level of abstraction allows you to move from one to another with ease

<p align="center">
<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F3c0dc574aa8c4b06adff6f91e01cda3d" />
</p>

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

Adding framework support is surprisingly easy with our plugins (docs coming soon!)

## No-code tooling

JSX Lite's static JSON format also enables no-code tooling for visual code editing and importing, for instance with [Builder.io](https://github.com/builderio/builder) or [Figma](https://github.com/BuilderIO/html-to-figma)

<img src="https://imgur.com/3TjfY2H.gif" >

<img src="https://i.imgur.com/vsAKt7f.gif" >

## Who uses it

- [Builder.io](https://github.com/builderio/builder)
- [Snap](https://github.com/builderio/snap)
- [HTML to Figma](https://github.com/builderio/html-to-figma)

## Status

| Framework    | Status      |
| ------------ | ----------- |
| React        | Alpha       |
| Vue          | Alpha       |
| Liquid       | Alpha       |
| Builder.io   | Alpha       |
| Solid        | Alpha       |
| Figma        | Alpha       |
| React Native | Planned     |
| Angular      | Planned     |
| Svelte       | Considering |

## Coming soon

- Stable (v1) release
- Plugin API docs for custom syntaxes and extensions
- VS code plugin

<br />
<p align="center">
  Made with ❤️ by <a target="_blank" href="https://www.builder.io/">Builder.io</a>
</p>
