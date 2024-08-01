---
'@builder.io/mitosis': patch
---

Fix: state initialization sequence in angular, init local states first so that bindings that depend upon them can use the correct values on ngOnInit
