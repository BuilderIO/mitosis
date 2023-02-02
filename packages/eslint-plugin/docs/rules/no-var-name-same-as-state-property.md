# no-var-name-same-as-state-property (no-var-name-same-as-state-property)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you declare a variable with the same name as a state property.

Examples of **incorrect** code for this rule:

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    foo: 'bar',
  });

  const foo = bar;

  return <div />;
}
```

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    foo: 'bar',

    abc() {
      const foo = 'baz';

      return foo;
    },
  });

  return <div />;
}
```

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    foo: 'bar',
  });

  function myFunction() {
    const foo = 'some value';
    state.foo = foo;
  }

  return <div />;
}
```

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    foo: 'bar',
  });

  function myFunction() {
    const { foo } = props.obj;

    state.foo = foo;
  }

  return <div />;
}
```

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    response: 'null',
    saveResponse(response) {
      state.response = response;
    },
  });

  return <div>Hello</div>;
}
```

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    response: 'null',
    saveResponse() {
      const bar = (response) => {
        return response;
      };
    },
  });

  return <div>Hello</div>;
}
```

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    response: 'null',
    saveResponse() {
      function baz(response) {
        return response;
      }
    },
  });

  return <div>Hello</div>;
}
```

Examples of **correct** code for this rule:

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    foo: 'bar',
  });

  const foo_ = bar;

  return <div />;
}
```

```js
import { useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useStore({
    foo: 'bar',
  });

  function myFunction() {
    const { foo: foo1 } = props.obj;

    state.foo = foo;
  }

  return <div />;
}
```
