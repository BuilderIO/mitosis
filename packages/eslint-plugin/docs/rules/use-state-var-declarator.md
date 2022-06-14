# use-state-var-declarator (use-state-var-declarator)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you assign useStore() to a variable named anything other than state.

Examples of **incorrect** code for this rule:

```js
export default function MyComponent(props) {
  const a = useStore();

  return <div />;
}
```

Examples of **correct** code for this rule:

```js
export default function MyComponent(props) {
  const state = useStore();
  return <div />;
}

export default function MyComponent(props) {
  const [name, setName] = useState();
  return <div />;
}
```
