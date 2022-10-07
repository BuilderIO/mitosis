import { useState } from '@builder.io/mitosis';

export default function MyBasicComponent(props: any) {
  const [attrs, setAttrs] = useState({ hello: 'world' });

  return <input {...attrs} {...props}></input>;
}
