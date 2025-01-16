---
'@builder.io/mitosis': patch
---

[angular, stencil]: Add `attributePassing` to enable passing attributes like `data-*`, `aria-*` or `class` to correct child.

There is a wired behaviour for Angular and Stencil (without shadow DOM), where attributes are rendered on parent elements like this:

**Input**

```angular2html
<!-- Angular -->
<my-component class="cool" data-nice="true" aria-label="wow"></my-component>
```

**Output**

```html
<!-- DOM -->
<my-component class="cool" data-nice="true" aria-label="wow">
  <button class="my-component">My Component</button>
</my-component>
```

In general, we want to pass those attributes down to the rendered child, like this:

```html
<!-- DOM -->
<my-component>
  <button class="my-component cool" data-nice="true" aria-label="wow">My Component</button>
</my-component>
```

We provide 2 ways to enable this attribute passing:

**Metadata**

```tsx
// my-component.lite.tsx
useMetadata({
  attributePassing: {
    enabled: true,
    // customRef: "_myRef";
  },
});
```

**Config**

```js
// mitosis.config.cjs
module.exports = {
  // ... other settings
  attributePassing: {
    enabled: true,
    // customRef: "_myRef";
  },
};
```

If you enable the ``attributePassing`` we add a new `ref` to the root element named `_root` to interact with the DOM element. If you wish to control the name of the ref, because you already have a `useRef` on your root element, you can use the `customRef` property to select it.
