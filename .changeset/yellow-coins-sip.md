---
'@builder.io/mitosis': patch
---

[React, Angular] fix: issue with ``state`` inside `key` attribute in `Fragment`.

Example:

`<Fragment key={state.xxx + "abc"}...` was generated in React with `state.xxx` and in Angular without `this.`.
