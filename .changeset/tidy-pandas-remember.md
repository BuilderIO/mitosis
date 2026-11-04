---
'@builder.io/mitosis': patch
---

[All] Bug: Preserve `\n` escape sequences inside string literals during code generation. The `dedent` helper converted every `\n` escape into a literal line break, corrupting code such as `split("\n")` across generators (a space in React/React Native output, an unterminated string in Solid). Escaped newlines are now only converted outside of string literals.
