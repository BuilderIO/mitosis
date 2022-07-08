import { component$, Host } from '@builder.io/qwik';

// Mitosis output for not yet include .d.ts, so ignore the types when importing.
// @ts-ignore
// import { MyComponent } from '@builder.io/e2e-app-qwik-output';

// Temporary import of the source code instead of build output;
// This works with vite dev, but not vite build.
import { MyComponent } from '@builder.io/e2e-app/qwik';

export const App = component$(() => {
  return (
    <Host>
      <MyComponent></MyComponent>
    </Host>
  );
});
