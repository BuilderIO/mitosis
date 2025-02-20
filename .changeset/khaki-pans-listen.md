---
'@builder.io/mitosis': patch
---

Angular: support to change the change detection strategy to `OnPush` using `useMetadata`

```ts
useMetadata({
  angular: {
    changeDetection: 'OnPush',
  },
});
```
