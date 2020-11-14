<p align="center"><img width="400" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F873aa9bf5d8d4960abbee6d913862e1c"></p>

<p align="center">
  Write components once, run everywhere. Compiles to Vue, React, Solid, Liquid, and more.
</p>

<img src="https://imgur.com/H1WTtGe.gif" />

## Why

- **Component libraries**. Think UI libraries (Material, Semantic, etc), SDKs, etc. This applies to both open source as well as larger companies who make internal design systems but must support multiple frameworks used internally

* **No-code tools**. We want to bridge the gap between code and no-code. No-code tools require a higher level of abstraction, but allow rich and intuitive editing and debugging experience. This also means you can drag/drop to build UIs and edit as code side by side, as well as generate React, Vue, etc code from no-code tools like [Builder.io](https://github.com/builderio/builder) and others (Figma, etc with time)

* **Modern workflows for all platforms**. E.g. Shopify is an enormously powerful platform but only supports rendering server side with their Liquid templating language. This means people either still write Shopify stores as liquid + jQuery, or opt to not render server side at all. With JSX lite you can modernize your workflow and generate Liquid code that hydrates to React in the browser making you still high speed and SEO friendly with SSR but then have fast and clean renders on the client and even be an SPA from there forward (no more server side navigarion after the first load).

* **JS framework fatigue**. If you have ever had to migrate a huge codebase from one framework to another, it's an absolute nightmare. Writing at a higher level of abstraction allows you to move from one to another with ease, for example when a hot new framework comes out that has something you need (better perf, native rendering, etc)

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

## No-code tooling

JSX Lite's static JSON format also enables no-code tooling for visual code editing, for instance with [Builder.io](https://github.com/builderio/builder) or Figma (coming soon)

<img src="https://imgur.com/3TjfY2H.gif" >

## Who uses it

- [Builder.io](https://github.com/builderio/builder)
- [Snap](https://github.com/builderio/snap)
- [HTML to Figma](https://github.com/builderio/html-to-figma) (coming soon)

## Status

| Framework    | Status  |
| ------------ | ------- |
| React        | Alpha   |
| Vue          | Alpha   |
| Liquid       | Alpha   |
| Builder      | Alpha   |
| Svelte       | Planned |
| Solid        | Planned |
| Figma        | Planned |
| React Native | Planned |
| Angular      | Planned |

## Coming soon

- JSX Lite Fiddle
- Stable (v1) release
- Plugin API docs for custom syntaxes and extensions
- Integration with design tools like Figma (Figma <-> JSX Lite)

<br />
<p align="center">
  Made with ❤️ by <a target="_blank" href="https://www.builder.io/">Builder.io</a>
</p>
