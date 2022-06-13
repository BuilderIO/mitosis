# no-async-methods-on-state (no-async-methods-on-state)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you use and async method as a value for state property.

Examples of **incorrect** code for this rule:

```js
export default function MyComponent() {
  const state = useStore({
    async doSomethingAsync(event) {
      return;
    },
  });
}
```

Examples of **correct** code for this rule:

```js
export default function MyComponent() {
  const state = useStore({
    doSomethingAsync(event) {
      void (async function () {
        const response = await fetch();
      })();
    },
  });
}
```
