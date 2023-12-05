# Angular Configuration

## Global Options

Add the options to `options.angular` inside [MitosisConfig](https://github.com/BuilderIO/mitosis/blob/main/docs/configuration.md):

```ts
export interface ToAngularOptions extends BaseTranspilerOptions {
  standalone?: boolean;
  preserveImports?: boolean;
  preserveFileExtensions?: boolean;
  importMapper?: Function;
  bootstrapMapper?: Function;
}
```

## Component Metadata

Use the `useMetadata.angular` hook to pass some component options to a single component:

```ts
export type ComponentMetadata = {
    ...
  angular?: {
    /* Mitosis uses `attr.XXX` as default see https://angular.io/guide/attribute-binding.
    If you want to skip some you can use the 'nativeAttributes'. */
    nativeAttributes: string[];
  };
    ...
}
```
