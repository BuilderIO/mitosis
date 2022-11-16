import { getComponentForPath } from '@builder.io/example-apps/react';

function App() {
  const Component = getComponentForPath(window.location.pathname);
  return (
    <div>
      <img src="../react-logo.png" width={50} />
      <Component />
    </div>
  );
}

export default App;
