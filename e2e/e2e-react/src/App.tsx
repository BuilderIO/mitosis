// Mitosis output for not yet include .d.ts, so ignore the types when importing.
// @ts-ignore
import { Homepage } from '@builder.io/e2e-app/react';

function App() {
  return <Homepage pathname={window.location.pathname} />;
}

export default App;
