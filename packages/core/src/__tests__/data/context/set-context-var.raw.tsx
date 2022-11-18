import { setContext, useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const [disabled, setDisabled] = useState(false);

  setContext('disabled', disabled);

  return <h1>Hello World</h1>;
}