---
'@builder.io/mitosis': patch
---

React: Fix type error when emitting an event without data (onSomeEvent: () => void; type will now have correct binding in the parent without unnecesarry undefined event parameter)
