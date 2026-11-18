---
'@builder.io/mitosis': patch
---

[All] Bug: declare `@babel/parser`, `@babel/traverse` and `@babel/types` as dependencies so the package loads under strict installs (Yarn PnP, pnpm without hoisting, npm linked).
