---
'@builder.io/mitosis': minor
---

[Angular] revamp of the angular signals generator

### New

- Support for template strings inside templates (converted to computed values)
- Support for spread values inside templates (converted to computed values)
- Support for TS `as X` expressions inside templates (converted to computed values)
- `export default class` component support using `defaultExportComponents` option
- Support dynamic component rendering (`ngComponentOutlet`)
- Dependent signals initialization via `onInit`
- `onMount` hook code to run only in the browser after view initialization
- `ngSkipHydration` support using `useMetadata`
- Helper utilities to set attributes and events on elements from arbitrary spread props
- Fully typed component inputs
- Dual-mode `computed()` handling:
  - In a `For` context with index and forName, uses plain functions
  - Otherwise, uses Angular’s `computed`
- Binding functions when passed as props

### Fixes

- Functions erroneously passed as `fn()` in callable expressions
- Callable-expression arguments not updating `state.x` or `props.x` to `x()`
