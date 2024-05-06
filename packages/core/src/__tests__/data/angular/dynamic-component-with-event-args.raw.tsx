import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const [Component, setComponent] = useState(HelloComponent);

  function onClick(event: any) {
    console.log('hello', event);
  }

  return (
    <Component
      hello="world"
      onClick={(event: any) => onClick(event)}
      {...props.attributes}
      {...props.something}
    >
      hello
    </Component>
  );
}
