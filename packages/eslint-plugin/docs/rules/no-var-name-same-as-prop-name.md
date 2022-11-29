# no-var-name-same-as-prop-name (no-var-name-same-as-prop-name)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you declare a variable with the same name as a prop name.

Examples of **incorrect** code for this rule:

```js
import { useStore } from "@builder.io/mitosis";

export default function MyComponent(props) {
  const state = useStore({
    getName() {
      const name = props.name
      return name + ' world'
    }
  });

  return (
    <div>
      {state.getName()}
    </div>
  );
}


import { useStore } from "@builder.io/mitosis";

export default function MyComponent(props) {
  const state = useStore({
    getName() {
      const name = props.name || 'hello'
      return name + ' world'
    }
  });

  return (
    <div>
      {state.getName()}
    </div>
  );
}
```

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    foo: 'bar',
  });

  function myFunction() {
    const foo = props.foo;
  }

  return <div />;
}
```

Examples of **correct** code for this rule:

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    getName() {
      const name = props.name_;
      return name + ' world';
    },
  });

  return <div>{state.getName()}</div>;
}
```
