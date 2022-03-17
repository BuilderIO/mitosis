# no-assign-props-to-state (no-assign-props-to-state)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to declare a variable with the same name as a state property.

Examples of **incorrect** code for this rule:

```js
import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useState({ text: props.text });
}

import { useState } from '@builder.io/mitosis';

export default function MyComponent({ text }) {
  const state = useState({ text: text });
}
```

Examples of **correct** code for this rule:

```js
import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const state = useState({ text: null });

  onMount(() => {
    state.text = props.text;
  });
}
```
