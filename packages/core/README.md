<p align="center"><img width="400" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F873aa9bf5d8d4960abbee6d913862e1c"></p>

<p align="center">
  Write components once, run everywhere. Compiles to Vue, React, Solid, Liquid, and more.
</p>

<img src="https://imgur.com/H1WTtGe.gif" />

## Why

### Component libraries

Managing support for libraries that provide logic or functionality meant to be used across frameworks (e.g. Material, Semantic, SDKs, etc.) is a _pain_. There are no viable current solutions for writing logic once and instantly having a version that works natively across frameworks.

An organization might want to build a new component library to be used across the business, but they also have teams working with different frameworks (e.g. React, Vue, Angular). Writing the library in JSX lite allows the component team to write the logic once and let each team consume the components in different formats.

### No-code tools

We want to bridge the gap between code and no-code. No-code tools require a higher level of abstraction and allow a rich and intuitive editing experience. But that abstraction usually means less control for those who know how to code, and the inability to work no-code workflows into the development cycle.

With JSX lite, you can drag/drop to build UIs and edit the code _side by side_, generating usable and editable code as you need to. Support for no-code tools like [Builder.io](https://github.com/builderio/builder) or [Figma](https://github.com/BuilderIO/html-to-figma)

### Modern unified workflows for all platforms

JSX lite allows you to incrementally adopt modern and familiar workflows for many different platforms. For example, Shopify is an enormously powerful ecommerce platform, but only supports rendering server-side with their Liquid templating language. This means people either need to build Shopify stores with Liquid + jQuery, or opt to not render server-side at all.

JSX lite allows you to modernize your workflow by generating Liquid code that hydrates to React in the browser, making your store high speed and SEO friendly with SSR while still having fast and clean renders on the client. This flow could even allow your site to become a SPA after the first page load (no more server-side navigation after the first load).

### JS framework fatigue

If you have ever had to migrate a huge codebase from one framework to another, it's an absolute nightmare. Writing at a higher level of abstraction allows you to move from one to another with ease. It also allows for incremental adoption of a new framework without having to write logic twice.

Plus, if a new framework comes along that you are just itching to try and think will solve your site's performance problems, all you need is to run a command to get a version of your app with that new framework. Bye bye rewrites!

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

JSX Lite's static JSON format also enables no-code tooling for visual code editing, for instance with [Builder.io](https://github.com/builderio/builder) or [Figma](https://github.com/BuilderIO/html-to-figma)

<img src="https://imgur.com/3TjfY2H.gif" >

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

- JSX Lite Fiddle
- Stable (v1) release
- Plugin API docs for custom syntaxes and extensions
- VS code plugin

<br />
<p align="center">
  Made with ❤️ by <a target="_blank" href="https://www.builder.io/">Builder.io</a>
</p>
