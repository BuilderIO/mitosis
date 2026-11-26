---
"@builder.io/mitosis": patch
---

[Builder] Bug: Read the link from the `_propertiesHref` marker before a plain `href`, so a component's own href input is kept when the block also has a link.
