<p align="center"><img width="400" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F873aa9bf5d8d4960abbee6d913862e1c"></p>

<p align="center">
  Write components once, run everywhere. Compiles to Vue, React, Solid, Liquid, and more.
</p>

<img src="https://cdn.builder.io/api/v1/image/assets%2F7f7bbcf72a1a4d72bac5daa359e7befd%2Ffcdc63b27ad24d928a95c5a456ba8564" />

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

<img src="https://i.imgur.com/KTpBDvH.gif" >

## Who uses it

- [Builder.io](https://github.com/builderio/builder)
- [Snap](https://github.com/builderio/snap)
- [HTML to Figma](https://github.com/builderio/html-to-figma) (coming soon)

## Status

| Framework    | Status      |
| ------------ | ----------- |
| React        | Alpha       |
| Vue          | Alpha       |
| Liquid       | Alpha       |
| Builder      | Alpha       |
| Svelte       | Planned     |
| Solid        | Planned     |
| Figma        | Planned     |
| React Native | Planned     |
| Angular      | Considering |

## Coming soon

- JSX Lite Fiddle
- Stable (v1) release
- Plugin API docs for custom syntaxes and extensions
- Integration with design tools like Figma (Figma <-> JSX Lite)

<br />
<p align="center">
  Made with ❤️ by <a target="_blank" href="https://www.builder.io/">Builder.io</a>
</p>
