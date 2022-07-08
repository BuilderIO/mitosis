# E2E test harness for Vue 3

"Yarn workspaces" uses its understanding of the build graph in a limited way, so
to recompile and run just this set of E2E tests, you can run these commands at
the project root:

```bash
yarn workspace @builder.io/e2e-app run build
yarn workspace @builder.io/e2e-vue3 run build
yarn workspace @builder.io/e2e-vue3 run e2e
```

This test harness copies the source output from the e2e-app project, because
that project emits Vue source code, rather than the compiled format suitable for
consumption via node_modules. While it is surely possible to consume .vue files
from node_modules, that isn't idiomatic and simple attempt yield
partially-broken components.
