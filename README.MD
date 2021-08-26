<br />
<p align="center"><img width="400" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F928fd46bd9d84a3fbc5b31fd5b93a7df"></p>

<p align="center">
  Write components once, run everywhere. Compiles to Vue, React, Solid, Angular, Svelte, Liquid, Qwik, and more. 
</p>

<p align="center">
  <a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" /></a>
  <a href="https://github.com/BuilderIO/mitosis/pulls"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
  <a href="https://github.com/BuilderIO/mitosis"><img alt="License" src="https://img.shields.io/github/license/BuilderIO/mitosis" /></a>
  <a href="https://www.npmjs.com/package/@builder.io/mitosis"><img alt="Types" src="https://img.shields.io/npm/types/@builder.io/mitosis" /></a>
  <a href="https://www.npmjs.com/package/@builder.io/mitosis" rel="nofollow"><img src="https://img.shields.io/npm/v/@builder.io/mitosis.svg?sanitize=true"></a>
</p>

<br />

<p align="center">
  <a href="https://jsx-lite.builder.io/">
    <img width="800" alt="Fiddle" src="https://imgur.com/H1WTtGe.gif" />
  </a>
</p>

<br />

<p align="center"><img width="700" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Feceb6573940b4af0a2b6d96719be45fc" /></p>

## At a glance

Mitosis is inspired by many modern frameworks. You'll see components look like React components and use React-like hooks, but have simple mutable state like Vue, use a static form of JSX like Solid, compile away like Svelte, and uses a simple, prescriptive structure like Angular.

This is what a basic Mitosis component that manages some state looks like:

```javascript
import { useState, Show, For } from '@builder.io/mitosis';

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

Learn more [in the docs](docs/overview.md)

## CLI

Try Mitosis out locally with our [CLI](packages/cli)

```bash
npm install -g @builder.io/mitosis-cli

mitosis compile --to=vue my-file.lite.jsx
```

## Why

### Component libraries

Managing support for libraries that provide UI components across frameworks is a _pain_, especially when webcomponents are not an option (e.g. for server side rendering, best performance, etc). With Mitosis you can write once, and run everywhere while maintaining full compatibilty with the target framework.

### Modern workflows for all platforms

Mitosis allows you to incrementally adopt modern and familiar workflows for many different platforms. For instance, when working with Shopify, you can server side render to liquid and hydrate with React.

### JS framework fatigue

If you have ever had to migrate a huge codebase from one framework to another, it's an absolute nightmare. Writing components at a higher level of abstraction allows you to move from one to another with ease.

### Design to code

With Mitosis, you can convert designs from [Figma](https://github.com/BuilderIO/html-to-figma) or Sketch and convert them to clean code for the framework of your choice. You can even use [Builder.io](https://github.com/builderio/builder) to visually drag/drop to build UIs and edit the code _side by side_.

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

Which can be reserialized into many languges and framworks. For example, to support angular, we just make a serializer that loops over the json and produces:

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

## Try it out

<table>
  <tbody>
  <tr>
      <td>
        <p>&nbsp;</p> <!-- spacer -->
        <p align="center">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ffb77e93c28e044178e4694cc939bf4cf" />
        </p>
        <p align="center">
        Use our <a href="https://github.com/builderio/figma-html"><b>Figma plugin</b></a> to turn designs into code!
        </p>
      </td>
      <td>
        <p>&nbsp;</p> <!-- spacer -->
        <p align="center">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa508a4de1529463fb0ea31ccc8da7a19" />
        </p>
        <p align="center">
          Try our  <a href="https://mitosis.builder.io/"><b>interactive fiddle</b></a>
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://github.com/builderio/figma-html"><img width="400" alt="Figma plugin" src="https://i.imgur.com/BoKsLFs.gif" /></a>
      </td>
      <td>
        <a href="https://mitosis.builder.io/"><img width="400" alt="Fiddle" src="https://imgur.com/H1WTtGe.gif" /></a>
      </td>
    </tr>
    <tr>
      <td>
        <p>&nbsp;</p> <!-- spacer -->
        <p align="center">
        <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ff83e94a9c504427cbc8a557f682efec3" />
        </p>
        <p align="center">
          Try our <a href="https://github.com/BuilderIO/vscode"><b>VS Code extension</b></a> for in-IDE visual coding
        </p>
      </td>
      <td>
        <p>&nbsp;</p> <!-- spacer -->
        <p align="center">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0f577e84eb4e4aa4a69d602dd376aa11" />
        </p>
        <p align="center">
          Try our <a href="https://apps.shopify.com/builder-2"><b>Shopify app</b></a> for visual Shopify store building
      </td>
    </tr>
    <tr>
    <td>
        <a href="https://github.com/BuilderIO/vscode"><img width="400" alt="Vscode plugin" src="https://i.imgur.com/UlWMkRx.gif" /></a>
      </td>
      <td>
        <a href="https://apps.shopify.com/builder-2"><img width="400" alt="Vscode plugin" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F97c87a29d88e463b9c1ad22b0329b2f7" /></a>
      </td>
    </tr>
    <tr>
      <td>
      <p>&nbsp;</p> <!-- spacer -->
        <p align="center">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F084b1ebc3de4422185f9d36a409f3a24" />
        </p>
        <p align="center">
          Try our <a href="https://github.com/builderio/builder"><b>headless CMS</b></a> for no-code APIs for all sites and apps
        </p>
      </td>
      <td>
      <p>&nbsp;</p> <!-- spacer -->
        <p align="center">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F2025f53be0ab472ca8fbb87381bfbc00" />
        </p>
        <p align="center">
          View our upcoming ecommerce <a href="https://headlessapp.store">integrations</a>
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://github.com/builderio/builder"><img width="400" alt="Vscode plugin" src="https://cdn.builder.io/api/v1/image/assets%2F444142b2cae54a19aeb8b5ba245feffe%2F8c2699f47fea48b296b43dbb422336e8" /></a>
      </td>
      <td>
        <a href="https://headlessapp.store"><img width="400" alt="Vscode plugin" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fd416b330ae7543089f70af8b930d8d85" /></a>
      </td>
    </tr>
    </tbody>
  </table>

## No-code tooling

Mitosis's static JSON format also enables no-code tooling for visual code editing and importing. You can see this with [Builder.io](https://github.com/builderio/builder) or [Figma](https://github.com/BuilderIO/html-to-figma).

<img src="https://i.imgur.com/BoKsLFs.gif" >

<img src="https://i.imgur.com/UlWMkRx.gif" >

## Formatting options

Mitosis supports settings for generating code to match your preferred formatting, libraries, etc. These output options will be customizable and extensible with plugins soon.

<img src="https://imgur.com/hWXfNF3.gif "/>

## Who uses it

- [Builder.io](https://github.com/builderio/builder)
- [Snap](https://github.com/builderio/snap)
- [HTML <> Figma](https://github.com/builderio/html-to-figma)
- [Build.](https://github.com/builderio/build.) (coming soon)

## Status

| Framework     | Status       |
| ------------- | ------------ |
| React         | Alpha        |
| Vue           | Alpha        |
| Liquid        | Alpha        |
| Builder.io    | Alpha        |
| Solid         | Alpha        |
| Figma         | Alpha        |
| Angular       | Alpha        |
| Svelte        | Alpha        |
| HTML/CSS/JS   | Alpha        |
| Webcomponents | Alpha        |
| React Native  | Alpha        |
| SwiftUI       | Experimental |

## Coming soon

- Stable (v1) release
- Plugin API docs for custom syntaxes and extensions
- VS code plugin

<br />
<p align="center">
  Made with ❤️ by <a target="_blank" href="https://www.builder.io/">Builder.io</a>
</p>
