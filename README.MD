# JSX Lite

Write JSX once that runs everywhere. Vue, React, Solid, Liquid, and more.

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
<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fca634cac3aef4570a284bb647a1b5228" />


## Why

1. Write JSX code _one time_ that can **compile and render to any language or framework**
2. **Edit the JSX code visually** using Builder.io's editor and write code / use your own coding tools _side by side_

<img src="https://i.imgur.com/KTpBDvH.gif" >

## Use cases

- **Platform universal code** - your same code compnents can run in a React app, or a Shopify store liquid template, a native app - you name it.
  - E.g. want to make an open source library but can't choose what framework(s) to support? Write it once in Builder JSX and generate code for all frameworks (React, Vue, Native, Shopify, etc...)
- **Future proof your code** - tired of writing the same UI components for every hot new framework as it comes out? Tried of duplicating components because you need to support multiple frameworks?
  - Write once and generate. New hot fraemework comes out? Write an adapter once and now all your current code supports the new framework
- **Edit visually** - visually edit all code using Builder.io. Share with designers or marketers to create, repurpose, and extend either as code or in a headless CMS such as Builder.io

## Coming soon

- Stable (v1) release
- Downloadable version of Builder.io's visual editor for visually editing Builder.io JSX locally
- Plugin API for custom syntaxes and extensions
