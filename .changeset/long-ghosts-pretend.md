---
'@builder.io/mitosis': patch
---

[React] Refactor how `react` handles mitosis ``Fragment``.

Using ``import { Fragment } from '@builder.io/mitosis';
`` and `<Fragment key={option}>` in mitosis, generates an empty fragment in ``react`` target: `<>`. With this improvement the generated output will be `<React.Fragment key={`key-${option}`}>`. This will help to avoid issues with same keys e.g. inside for loops.


