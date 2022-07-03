# E2E test harness for Qwik

```bash
yarn workspace @builder.io/e2e-app run build
yarn workspace @builder.io/e2e-qwik run build
yarn workspace @builder.io/e2e-qwik run e2e
```

Unlike the other E2E harnesses, this one run vite in dev mode to work around an
issue with Qwik.
