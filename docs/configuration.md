In the root of the project you run `mitosis` from, you can add a `mitosis.config.js` file that will be read by Mitosis. Checkout [the types](/packages/core/src/types/config.ts) for what settings you can provide.

Note that you can configure each target generator individually, providing plugins on a case-by-case basis.

### TypeScript configuration

TypeScript includes a full-fledged JSX compiler. Add the following configuration to your tsconfig.json to transpile JSX to mitosis-compatible JavaScript:

```js
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@builder.io/mitosis",
    // other config here
  }
}
```

More example see [e2e-app](../packages/e2e-app/tsconfig.json)
