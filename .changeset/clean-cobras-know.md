---
'@builder.io/mitosis': patch
---

[All] Refactored `useMetadata` hook to enable import resolution instead of simple `JSON5` parsing.

You could use a normal JS `Object` and import it inside your `*.lite.tsx` file like this:

```ts
// data.ts

export const myMetadata: Record<string, string | number> = {
  a: 'b',
  c: 1,
};
```

```tsx
// my-button.lite.tsx
import { useMetadata } from '@builder.io/mitosis';
import { myMetadata } from './data.ts';

useMetadata({
  x: 'y',
  my: myMetadata,
});

export default function MyButton() {
  return <button></button>;
}
```
