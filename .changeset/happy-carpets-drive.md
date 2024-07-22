---
'@builder.io/mitosis': patch
---

Fix: Angular generator to run `onMount` and `onUpdate` hooks on the client side only and use `onInit` hook to run both on CSR and SSR
