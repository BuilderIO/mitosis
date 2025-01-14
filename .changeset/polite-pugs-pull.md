---
'@builder.io/mitosis': patch
---

[angular]: Fix issue with events forced to become `toLowerCase()`.

Based on [choosing-event-names](https://angular.dev/guide/components/outputs#choosing-event-names) custom events are camelCase. 
[DOM events](https://www.w3schools.com/jsref/dom_obj_event.asp) are always lower-cased for Angular components.

Checkout [event-handlers.ts](https://github.com/BuilderIO/mitosis/blob/main/packages/core/src/helpers/event-handlers.ts) to see all events which are automatically lower-cased everything else will be camelCase.

If you need some other event to be lower-cased you can use `useMetadata.angular.nativeEvents`:

```tsx
import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  angular: {
    nativeEvents: ['onNativeEvent'],
  },
});

export default function MyComponent(props) {
  return (
    <div>
      <input onNativeEvent={(event) => console.log(event)} />
      Hello!
    </div>
  );
}
```
