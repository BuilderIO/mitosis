# no-conditional-logic-in-component-render (no-conditional-logic-in-component-render)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you write conditional logic inside jsx.

Examples of **incorrect** code for this rule:

```js
export default function MyComponent(props) {
  if (x > 5) return <div />;
  return <div />;
}
```

Examples of **correct** code for this rule:

```js
export default function MyComponent(props) {
  return <div />;
}

export default function MyComponent(props) {
  useEffect(() => {
    if (x > 5) {
      return foo;
    }
  }, []);
  return <div />;
}
```
