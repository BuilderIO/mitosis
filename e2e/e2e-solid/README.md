# E2E test harness for Solid

"Yarn workspaces" uses its understanding of the build graph in a limited way, so
to recompile and run just this set of E2E tests, you can run these commands at
the project root:

```bash
pnpm --filter @builder.io/e2e-app build
pnpm --filter @builder.io/e2e-solid build
pnpm --filter @builder.io/e2e-solid e2e
```
