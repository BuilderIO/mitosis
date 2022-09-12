In the root of the project you run `mitosis` from, you can add a `mitosis.config.js` file that will be read by Mitosis. Checkout [the types](/packages/core/src/types/config.ts) for what settings you can provide.Also could specify config file by option: `--config=<file>`.

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

For an example of TS configuration, look at our [basic example](../examples/basic/tsconfig.json)'s `tsconfig.json`.
