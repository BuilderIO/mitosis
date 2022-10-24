# prefer-show-over-ternary-operator (prefer-show-over-ternary-operator)

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

```js
  export default function MyComponent(props) {
    return <div> <input value={props.a ? 'a' : 'b'} /> </div>;
```

```js
export default function MyComponent(props) {
      const state = useState({
        getName() {
          props.a ? 'a' : 'b'
        }
      })
return <div />;
```
