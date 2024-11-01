---
'@builder.io/mitosis': patch
---

[Vue] fix: ref wasn't imported when using `useRef` hook without using `useState`

[Vue] fix: Composition api always use `ref()` wihtout any class -> we don't need this., but we always use `.value`

[Vue] fix: `ref` could be `null` for `useRef` see: https://vuejs.org/guide/essentials/template-refs.html#accessing-the-refs

[All] fix: replace `this.` expression in `useState` with `state.` to resolve correct `stripStateAndPropsRefs()` function inside all generators
