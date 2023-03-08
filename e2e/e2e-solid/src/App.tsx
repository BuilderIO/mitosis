// Mitosis output for not yet include .d.ts, so ignore the types when importing.
// @ts-ignore
import { E2eApp } from '@builder.io/e2e-app/solid';

import type { Component } from 'solid-js';

const App: Component = () => {
  return <E2eApp />;
};

export default App;
