import { AutoComplete, Todos } from '@builder.io/talk-app-react';

function App() {
  const getValues = async () => {
    return ['Hello', 'Modern', 'Frontends', 'Live!'];
  };
  const getComponentForPath = (path) => {
    switch (path) {
      case '/todo':
        return <Todos />;
      case '/autocomplete':
        return (
          <AutoComplete
            renderChild={(props) => <span>{props.item}</span>}
            getValues={getValues}
            transformData={(x) => x}
          />
        );
      default:
        return <Todos />;
    }
  };

  return (
    <div>
      <img src="../react-logo.png" width={50} />
      {getComponentForPath(window.location.pathname)}
    </div>
  );
}

export default App;
