import { component$ } from '@builder.io/qwik';

// Qwik libraries are usually typed, but Mitosis Qwik output is untyped,
// so we must consume it untyped.
// @ts-ignore
import { MyComponent } from '@builder.io/e2e-app-qwik-output';

export const App = component$(() => {
  return <MyComponent></MyComponent>;
});
