import { setContext, useState } from '@builder.io/mitosis';

export default function MyComponent(props) {
  const [disabled, setDisabled] = useState(false);

  setContext('disabled', { disabled, foo: 'bar' });

  return <h1>Hello World</h1>;
}
