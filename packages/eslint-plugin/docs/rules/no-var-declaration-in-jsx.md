# no-var-declaration-in-jsx (no-var-declaration-in-jsx)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you declare a variable inside jsx.

Examples of **incorrect** code for this rule:

```js
export default function MyComponent(props) {
  return (
    <div>
      {a.map((x) => {
        const foo = 'bar';
        return <span>{x}</span>;
      })}
    </div>
  );
}
```

Examples of **correct** code for this rule:

```js
export default function MyComponent(props) {
  return (
    <div>
      {a.map((x) => {
        return <span>{x}</span>;
      })}
    </div>
  );
}

export default function MyComponent(props) {
  return (
    <div
      someProp={a.find((b) => {
        const { x } = b;
        return x < 1;
      })}
    />
  );
}
```
