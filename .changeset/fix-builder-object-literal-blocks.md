---
'@builder.io/mitosis': patch
---

Builder: fix object-valued component options that hold Builder blocks (e.g. `CodeSnippetsV2`'s `customTabContent`). Object literals whose first key contains an underscore or is quoted are now recognized as expressions, the `return _virtual_index` function-body detection only matches at the end of the code, and elements embedded as literal JSON are no longer re-normalized (which overwrote their `code.bindings`).
