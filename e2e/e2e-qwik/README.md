# E2E test harness for Qwik

```bash
yarn workspace @builder.io/e2e-app run mitosis-qwik
yarn workspace @builder.io/e2e-app-qwik-output copy-src
yarn workspace @builder.io/e2e-app-qwik-output build.lib
yarn workspace @builder.io/e2e-qwik run build
yarn workspace @builder.io/e2e-qwik run serve
```

Unlike the other E2E harnesses, this one run vite in dev mode to work around an
issue with Qwik.
