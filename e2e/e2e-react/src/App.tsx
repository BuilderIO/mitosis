// Mitosis output for not yet include .d.ts, so ignore the types when importing.
// Trigger nx remote cache: 1
// @ts-ignore
import { E2eApp } from '@builder.io/e2e-app/react';

function App() {
  return <E2eApp pathname={window.location.pathname} />;
}

export default App;
