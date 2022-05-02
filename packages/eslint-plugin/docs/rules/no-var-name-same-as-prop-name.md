# no-var-name-same-as-prop-name (no-var-name-same-as-prop-name)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you declare a variable with the same name as a prop name.

Examples of **incorrect** code for this rule:

```js
import { useState } from "@builder.io/mitosis";

export default function MyComponent(props) {
  const state = useState({
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


import { useState } from "@builder.io/mitosis";

export default function MyComponent(props) {
  const state = useState({
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

Examples of **correct** code for this rule:

```js
import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useState({
    getName() {
      const name = props.name_;
      return name + ' world';
    },
  });

  return <div>{state.getName()}</div>;
}
```
