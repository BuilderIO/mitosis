## Context

Mitosis Contexts must be:

- created in their own file
- the file name _must_ end with `context.lite.ts`
- the default export must be a function that returns a context object

Example:

```ts
// simple.context.lite.ts
import { createContext } from '@builder.io/mitosis';

export default createContext({
  foo: 'bar',
  get fooUpperCase() {
    return this.foo.toUpperCase();
  },
  someMethod() {
    return this.fooUpperCase.toLowercase();
  },
  content: null,
  context: {} as any,
  state: {},
});
```

Then you can use it in your components:

```tsx
import { setContext, useContext } from '@builder.io/mitosis';
import Context from './simple.context.lite';

export default function ComponentWithContext(props: { content: string }) {
  // you can access the context using `useContext`
  const foo = useContext(Context);

  // you can use `setContext` to provide a new value for the context
  setContext(Context, {
    foo: 'baz',
    content() {
      return props.content;
    },
  });

  return (
    // you can also use `Context.provider` to provide a new value for the context
    <Context.Provider value={{ bar: 'baz' }}>{foo.value}</Context.Provider>
  );
}
```
