import { useState, useStore } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const [attrsUsingUseState] = useState({
    hello: 'world',
  });

  const state = useStore({
    properties: {
      style: 'color: blue',
      onClick: () => console.log('pressed'),
    },
    specifics: {
      someSpecificState: 'specific',
    },
  });

  return (
    <div
      {...attrsUsingUseState}
      {...state.properties}
      {...props.attributes}
      {...{ someOtherAttrs: props.accessHere, someStateAttrs: state.specifics }}
    >
      Hello! I can run natively in React, Vue, Svelte, Qwik, and many more frameworks!
    </div>
  );
}
