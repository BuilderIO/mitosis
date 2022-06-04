// TODO make Mitosis output include TS suitable to use via node_modules.
// @ts-ignore
import MyComponent from '@builder.io/e2e-app/solid/components/my-component.lite';

import type { Component } from 'solid-js';

const App: Component = () => {
  return <MyComponent></MyComponent>;
};

export default App;
