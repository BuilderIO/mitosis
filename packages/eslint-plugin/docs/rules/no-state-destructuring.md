# css-no-vars (css-no-vars)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you try to use destructuring with state.

Examples of **incorrect** code for this rule:

```js
export default function MyComponent() {
  const state = useState({ foo: '1' });

  onMount(() => {
    const { foo } = state;
  });
}
```

Examples of **correct** code for this rule:

```js
export default function MyComponent() {
  const state = useState({ foo: '1' });

  onMount(() => {
    const foo = state.foo;
  });
}
```
