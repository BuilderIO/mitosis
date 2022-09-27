# only-default-function-and-imports (only-default-function-and-imports)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you export anything other than import declarations, the component itself (in a default export), and type declarations file.

Examples of **incorrect** code for this rule:

```js
import { a } from 'b';
export default function MyComponent(props) {
  return <div />;
}
export const x = y;
```

Examples of **correct** code for this rule:

```js
import x from 'y';
import { a } from 'b';
export default function MyComponent(props) {
  return <div />;
}

import x from "y";
import {a} from "b";

export type Props = {}
export interface OtherProps {}
type Props1 = {}
interface OtherProps2 {}

export default function MyComponent(props) {
  return (
      <div />
  );
}
```

```js
useMetadata({
  qwik: {
    component: {
      isLight: true,
    },
  },
});

export default function RenderComponent(props) {
  return <div>Text</div>;
}
```
