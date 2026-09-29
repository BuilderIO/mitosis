---
'@builder.io/mitosis': patch
---

[Svelte]: add `memoizeGetters` option. When enabled, getter results are cached until their dependencies change or the current task ends, instead of re-running the getter body on every read.
