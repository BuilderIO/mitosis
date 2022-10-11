# only-default-function-and-imports (only-default-function-and-imports)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you use ternary
expression to render JSX.

Examples of **incorrect** code for this rule:

```js
export default function MyComponent(props) {
  return <div>{foo ? <bar /> : <baz />}</div>;
}
```

Examples of **correct** code for this rule:

```js
export default function MyComponent(props) {
  return (
    <div>
      <Show when={foo}>
        <bar />
      </Show>
      <Show when={!foo}>
        <baz />
      </Show>
    </div>
  );
}
```
