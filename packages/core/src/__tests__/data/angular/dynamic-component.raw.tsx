import { useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const [obj, setObj] = useState(HelloComponent);

  function onClick() {
    console.log('hello');
  }

  return (
    <obj.Component onClick={() => onClick()} {...props.attributes} {...props.something}>
      hello
      {props.children}
    </obj.Component>
  );
}
