# ref-no-current (ref-no-current)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you try to access the property current on refs.

Examples of **incorrect** code for this rule:

```js
import { useRef } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const inputRef = useRef();

  const myFn = () => {
    inputRef.current.focus();
  };

  return <div />;
}

import { useRef as useR } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const inputRef = useR();

  const myFn = () => {
    inputRef.current.focus();
  };

  return <div />;
}
```

Examples of **correct** code for this rule:

```js
import { useRef } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const inputRef = useRef();
  const myFn = () => {
    inputRef.focus();
  };
  return <div />;
}

import { useRef } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const someRef = useRef();
  const myFn = () => {
    someRef = 1;
  };
  return <div />;
}
```
