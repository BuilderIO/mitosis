import { useState } from '@builder.io/mitosis';

export default function MyBasicGetterComponent() {
  const state = useState({
    get myGetterFn() {
      return 'PatrickJS';
    },
  });

  return <div>{state.myGetterFn}</div>;
}
