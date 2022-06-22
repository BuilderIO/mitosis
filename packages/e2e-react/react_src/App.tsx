// Consume the compiled React component, not the lite.tsx file (which is a debugging reference)
// @ts-ignore
import MyComponent from './lib/react/src/components/my-component';

// Make our copy of React available globally, where the imported components expect it.
import React from 'react';
window.React = React;

function App() {
  return <MyComponent></MyComponent>;
}

export default App;
