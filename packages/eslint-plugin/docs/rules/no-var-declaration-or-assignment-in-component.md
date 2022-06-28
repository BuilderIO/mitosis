# no-var-declaration-or-assignment-in-component (no-var-declaration-or-assignment-in-component)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you declare or assign a variable inside Mitosis component file.

Examples of **incorrect** code for this rule:

```js
export default function MyComponent(props) {
  const a = b;

  return <div />;
}

let a;
export default function MyComponent(props) {
  a = b;

  return <div />;
}

export default function MyComponent(props) {
  let a;
  a = b;

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
    const a = b;
  }, []);

  return <div />;
}

export default function MyComponent(props) {
  const context = useContext(x)

  const state = useStore({ name: null })

  return (
      <div />
  );
}

export default function MyComponent(props) {
  const ref = useRef()

  return (
      <div />
  );
}
```
