---
'@builder.io/mitosis': patch
---

Angular: support to bypass sanitization of innerHTML by default, this can be overriden in `useMetadata`

```ts
useMetadata({
  angular: {
    sanitizeInnerHTML: true, // doesn't use the sanitizer.bypassSecurityTrustHtml
  },
});
```
