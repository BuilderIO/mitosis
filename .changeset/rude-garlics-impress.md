---
'@builder.io/mitosis': patch
---

Angular: Fix: state initialization sequence. Initialize states in `ngOnInit` first, followed by bindings that depend upon them.
