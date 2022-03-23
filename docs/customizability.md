**Table of contents**

- [Plugins](#plugins)
- [useMetadata](#useMetadata)

When building Mitosis components, you might sometimes have unique and special needs. If you want to transform your Mitosis-generated output to fit your needs, by doing things like:

- add a special import statement at the top of each mitosis file
- remove a specific style attribute for one given target (for example, if you want your `react-native` output to omit a specific styling attribute that you rley on elsewhere.)
- modify only _some_ of your components to be dynamically imported

This (and much more) is possible thanks to Mitosis' powerful plugin system.

## Plugins

In your directory's `mitosis.config.js`, you can provide a `plugins` array for each code generator. You have many different kinds of plugins:

```typescript
export type Plugin = {
  json?: {
    // Happens before any modifiers
    pre?: (json: MitosisComponent) => MitosisComponent | void;
    // Happens after built in modifiers
    post?: (json: MitosisComponent) => MitosisComponent | void;
  };
  code?: {
    // Happens before formatting
    pre?: (code: string) => string;
    // Happens after formatting
    post?: (code: string) => string;
  };
};
```

We run plugins at 4 different points:

- preJSON: before any default modifiers run on the Mitosis JSON
- postJSON: after all built-in modifiers run on the Mitosis JSON
- preCode: before any formatting runs on the Mitosis output (we format using `prettier`)
- postCode: after any formatting runs on the Mitosis output (we format using `prettier`)

The JSON plugins receive the Mitosis component's full JSON object as an argument. Similarly, the code plugins receive the code string.

We even use plugins internally to generate Mitosis components! Here's an example of our react-native plugin: https://github.com/BuilderIO/mitosis/blob/328572740bb3ff2f66924d431dc6360f5f4e0c62/packages/core/src/generators/react-native.ts#L82-L118

You will see that we traverse the JSON nodes, and for each MitosisNode, we remove `class` and `className` values and bindings. That's because React-Native does not support class-names on mobile.

## useMetadata

What happens if you want a plugin to only apply to a specific set of components? Or if you'd like to provide some metadata for your plugin, and that metadata will depend on which component is being compiled?

This is where our `useMetadata` hook comes in handy. All you need to do is import and use the hook (you can use it anywhere in your mitosis component file, even at the top root level!):

```tsx
import { useMetadata, useState, onMount, For, Show } from '@builder.io/mitosis';

useMetadata({ mySpecialComponentType: 'ABC' });

export default function SmileReviews(props: SmileReviewsProps) {
  return <div>{/**/}</div>;
}
```

The metadata will be stored in your mitosis component's JSON, under `json.meta.useMetadata.mySpecialComponentType`. You can then use it in your JSON pre/post plugins:

```tsx
const plugin = {
  json: {
    pre: (json: MitosisComponent) => {
      const myComponentType = json.meta.useMetadata?.mySpecialComponentType;
      if (myComponentType === 'ABC') {
        //...
      }
    },
  },
};
```
