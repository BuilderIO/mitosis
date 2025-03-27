---
'@builder.io/mitosis': minor
---

[angular]: Angular v17.2+ uses [signals](https://angular.dev/guide/signals) as a new feature.
This allows the generator to match better with other targets (`onUpdate` becomes [`effect`](https://angular.dev/guide/signals#effects)).

This PR will rewrite the complete Angular generator to match all new features for Angular.

You can access the new Angular generator by using the `api="signals"` inside your mitosis config e.g.:

```js
/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  targets: ['angular', 'react', 'vue'],
  options: {
    angular: {
      api: 'signals',
    },
    react: {},
    vue: {},
  },
};
```

Furthermore, this PR will fix some issues with the angular output by using Babel instead of search and replace. Additionally, we use [`@if`](https://angular.dev/api/core/@if) etc. to provide a better output.

Some features are not yet implemented for signals api:

- Spread props - `<div {...rest}>{children}</div>`
- Dynamic components:


  ```tsx
export default function MyComponent(props) {
const [obj, setObj] = useState(FooComponent);

return (
<obj>{props.children}</obj>);
}
  ```

