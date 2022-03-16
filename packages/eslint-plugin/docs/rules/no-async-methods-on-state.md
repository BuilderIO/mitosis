# css-no-vars (css-no-vars)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you use and async method as a value for state property.

Examples of **incorrect** code for this rule:

```js
import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useState({
    foo: 'bar',
  });

  const foo = bar;

  return <div />;
}
```

Examples of **correct** code for this rule:

```js
import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useState({
    foo: 'bar',
  });

  const foo_ = bar;

  return <div />;
}
```
