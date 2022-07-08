// Mitosis output for not yet include .d.ts, so ignore the types when importing.
// @ts-ignore
import { MyComponent } from '@builder.io/e2e-app/react';
import React from 'react';

// Accommodate Mitosis output - assumes React is a global.
window.React = React;

function App() {
  return <MyComponent></MyComponent>;
}

export default App;
